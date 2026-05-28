require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const captainModel = require('../models/captain.model');
const blackListTokenModel = require('../models/blackListToken.model');
const AppError = require("../utils/appError");

let channel;
let replyQueue;
const RABBITMQ_URL = process.env.RABBIT_URL;


// Connect to RabbitMQ
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        replyQueue = await channel.assertQueue('', {
            exclusive: true
        });
        console.log('Connected to RabbitMQ');

    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        process.exit(1);
    }
}


// Publish (RPC Pattern)
async function publishToQueue(queue, message) {
    if (!channel) throw new AppError('Channel not connected', "RABBITMQ_ERROR", 500);

    const correlationId = uuidv4();
    // const replyQueue = await channel.assertQueue('', { exclusive: true });

    channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        {
            correlationId,
            replyTo: replyQueue.queue,
            persistent: true
        }
    );

    const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new AppError("RPC Timeout: No reply received from consumer", "RABBITMQ_TIMEOUT", 504));
        }, 5000);

        channel.consume(
            replyQueue.queue,
            (msg) => {
                if (!msg) return;

                if (msg.properties.correlationId === correlationId) {

                    clearTimeout(timeout);

                    const response = JSON.parse(msg.content.toString());

                    channel.cancel(msg.fields.consumerTag)
                        .then(() => resolve(response))
                        .catch(() => resolve(response));
                }
            },
            { noAck: true }
        );
    });

    return response;
}


//  Subscribe (Consumer)
async function subscribeToQueue(queue) {
    if (!channel) {
        throw new AppError('RabbitMQ channel is not initialized', "RABBITMQ_ERROR", 500);
    }

    await channel.assertQueue(queue, {
        durable: true
    });

    channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
            const data = JSON.parse(msg.content.toString());
            let response;

            if (queue === "isBlackList-captain") {
                console.log("recieved", queue);
                response = await blackListTokenModel.findOne({ token: data.token }).lean();

            } else if (queue === "get-captain") {
                console.log("recieved", queue, data._id);
                response = await captainModel.findOne({ _id: data._id }).lean();
                console.log("reponse", response);

            }
            else if (queue === "notification-ride-ended") {
                const captain = await captainModel.findById(data.captainId).select("socketId").lean();
                if (captain?.socketId) {
                    sendMessageToSocketId(captain.socketId, "ride-ended", data.message);
                }
            }
            else if (queue === "get-captainInTheRadius") {
                console.log("Processing get-captainInTheRadius for:", data);
                response = await captainModel.find({
                    status: "active",
                    isAvailable: true,
                    "vehicle.vehicleType": data.vehicleType.toLowerCase(),
                    location: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [data.lng, data.lat]
                            },
                            $maxDistance: data.radius * 1000 // meters
                        }
                    }
                }).select("_id socketId").limit(10).lean();
                console.log("Query response:", response);

            } else if (queue === "captain-update") {
                await captainModel.findByIdAndUpdate(
                    data._id,
                    { $set: data.updateData },
                    { new: true }
                ).lean();
            } else if (queue === "ride-cancelled") {
                await captainModel.updateOne({
                    _id: data.captainId
                }, {
                    $set: {
                        isAvailable: true,
                    }
                });
            }
            else if (queue === "CAPTAIN_CREATED") {
                try {
                    console.log("recieved", queue);
                    const existingCaptain = await captainModel.findOne({ email: data.email });
                    if (existingCaptain) {
                        console.log("captain already exists", existingCaptain);
                        return;
                    } else {
                        console.log("createing captain", data)
                        const res = await captainModel.create({
                            _id: data.captainId,
                            fullName: {
                                firstName: data.firstName,
                                lastName: data.lastName || ""
                            },
                            email: data.email,
                            vehicle: data.vehicle,
                            location: { type: "Point", coordinates: [0, 0] }
                        })
                        console.log(" Synced new captain from Auth:", data.email);
                        if (!res) {
                            console.log("captain not created")
                        } else {
                            console.log("captain created successfully:", res);
                        }

                    }
                    response = { success: true };
                } catch (err) {
                    console.error(" Failed to sync captain:", err.message);
                    response = { success: false, error: err.message };
                }
            }

            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(response || [])),
                {
                    correlationId: msg.properties.correlationId
                }
            );

            channel.ack(msg);

        } catch (err) {
            console.error("Queue processing error:", err);

            // Send error reply to prevent the publisher from hanging indefinitely
            if (msg.properties.replyTo) {
                channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify({ error: err.message })),
                    { correlationId: msg.properties.correlationId }
                );
            }
            channel.ack(msg);
        }
    });
}


module.exports = {
    publishToQueue,
    subscribeToQueue,
    connectRabbitMQ
};