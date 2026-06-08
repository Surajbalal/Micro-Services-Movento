require('dotenv').config();
const {v4: uuidv4} = require('uuid')
const amqp = require('amqplib');
const AppError = require("../utils/appError");
const rideModel = require('../models/ride.model');
const { sendMessageToSocketId } = require('../socket/socket');

let channel;
const RABBITMQ_URL = process.env.RABBIT_URL
console.log(RABBITMQ_URL,'hello this is rabbit url');

// Connect to RabbitMQ using the connection URL from the environment variable
async function connectRabbitMQ() {

    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        process.exit(1);
    }
}

// Publish a message to a specific queue
async function publishToQueue(queue, message) {
    if (!channel) throw new AppError('Channel not connected', "RABBITMQ_ERROR", 500);
    console.log("publish to",queue);
    const correlationId = uuidv4();
    const replyQueue = await channel.assertQueue('', { exclusive: true });

    const responsePromise = new Promise((resolve) => {
        channel.consume(
            replyQueue.queue,
            (msg) => {
                if (!msg) return;
                
                if (msg.properties.correlationId === correlationId) {
                    const response = JSON.parse(msg.content.toString());
                    channel.cancel(msg.fields.consumerTag).then(() => {
                        channel.deleteQueue(replyQueue.queue);
                        resolve(response);
                    }).catch(() => resolve(response));
                }
            },
            { noAck: true }
        );
    });

    channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        {
            correlationId,
            replyTo: replyQueue.queue
        }
    );

    return await responsePromise;
}

// publishEvent → fire-and-forget pattern → no response required.

function publishEvent(queue, message) {
  if (!channel) throw new Error("Channel not connected");

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
}
    
// Subscribe to a specific queue
async function subscribeToQueue(queue) {
    if (!channel) {
        throw new AppError('RabbitMQ channel is not initialized', "RABBITMQ_ERROR", 500);
    }

    await channel.assertQueue(queue);

    channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
            const data = JSON.parse(msg.content.toString());
            let response;

            console.log("Received:", queue);

            if (queue === "ride-payment-success") {
                try {
                    console.log("PAYMENT SUCCESS DATA:", data);
                    const updatedRide = await rideModel.findByIdAndUpdate(
                        data.rideId,
                        { $set: { "payment.status": "paid" } },
                        { new: true }
                    );
                    if (updatedRide) {
                        // Notify both user and captain in real-time
                        sendMessageToSocketId(
                            `user:${updatedRide.user}`,
                            "payment-status-updated",
                            { rideId: updatedRide._id, paymentStatus: "paid" }
                        );
                        if (updatedRide.captain) {
                            sendMessageToSocketId(
                                `captain:${updatedRide.captain}`,
                                "payment-status-updated",
                                { rideId: updatedRide._id, paymentStatus: "paid" }
                            );
                        }
                    }
                    response = { success: true };
                } catch (error) {
                    console.error("ride-payment-success handler error:", error);
                    response = { success: false, error: error.message };
                }
            }
            else if(queue === "ride-payment-failed"){
                try {
                    const updatedRide = await rideModel.findByIdAndUpdate(
                        data.rideId,
                        { $set: { "payment.status": "failed", "payment.reason": data.reason } },
                        { new: true }
                    );
                    if (updatedRide) {
                        sendMessageToSocketId(
                            `user:${updatedRide.user}`,
                            "payment-status-updated",
                            { rideId: updatedRide._id, paymentStatus: "failed" }
                        );
                        if (updatedRide.captain) {
                            sendMessageToSocketId(
                                `captain:${updatedRide.captain}`,
                                "payment-status-updated",
                                { rideId: updatedRide._id, paymentStatus: "failed" }
                            );
                        }
                    }
                    response = { success: true };
                } catch (error) {
                    console.error("ride-payment-failed handler error:", error);
                    response = { success: false, error: error.message };
                }
            }

            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(response)),
                {
                    correlationId: msg.properties.correlationId
                }
            );

            channel.ack(msg);

        } catch (err) {
            console.error("Consumer error:", err);
            channel.ack(msg);
        }
    });
}
// Initialize the RabbitMQ connection


module.exports = {
    publishToQueue,
    subscribeToQueue,
    connectRabbitMQ,
    publishEvent
};