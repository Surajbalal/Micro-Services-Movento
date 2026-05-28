require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const amqp = require("amqplib");
const blackListTokenModel = require("../models/blackListToken.model");
const userModel = require("../models/user.models");
const config = require('../config/config')
const AppError = require("../utils/appError");
// const { sendMessageToSocketId } = require("../socket");
let channel;


// Connect to RabbitMQ using the connection URL from the environment variable
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(config.RABBIT_URL);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
}

// Publish a message to a specific queue
async function publishToQueue(queue, message) {
  const correlationId = uuidv4();
  if (!channel) throw new AppError("Channel not connected", "RABBITMQ_ERROR", 500);

  const replyQueue = await channel.assertQueue("", { exclusive: true });

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    correlationId,
    replyTo: replyQueue.queue,
  });

  const response = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new AppError("RPC Timeout: No reply received from consumer", "RABBITMQ_TIMEOUT", 504));
    }, 5000);

    channel.consume(
      replyQueue.queue,
      (message) => {
        if (message.properties.correlationId == correlationId) {
          clearTimeout(timeout);
          resolve(JSON.parse(message.content.toString()));
        }
      },
      { noAck: true },
    );
  });
  return response;
}

// Subscribe to a specific queue
async function subscribeToQueue(queue) {
  if (!channel) {
    throw new AppError("RabbitMQ channel is not initialized", "RABBITMQ_ERROR", 500);
  }
  await channel.assertQueue(queue);
  channel.consume(queue, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log("Received message on:", queue);
    console.log(data);

    let response;

    if (queue == "isBlackList-user") {
      console.log("called", queue);
      response = await blackListTokenModel.findOne({ token: data.token }).lean();
    } else if (queue == "get-user") {
      response = await userModel.findById(data._id).lean();
    } else if (queue == "update-user") {
      response = await userModel.findByIdAndUpdate(data._id, {
        $set: data.updateData,
      });
    } else if (queue === "notification-ride-ended") {
      const { sendMessageToSocketId } = require("../socket"); 
      const user = await userModel.findById(data.userId).select("socketId").lean();

      if (user?.socketId) {
        sendMessageToSocketId(user?.socketId, "ride-ended", data);
      }
      //  response = { success: true };
    } else if (queue === "USER_CREATED") {
      try {
        const existingUser = await userModel.findOne({ email: data.email });
        if (!existingUser) {
          await userModel.create({
            _id: data.userId,
            fullName: {
              firstName: data.firstName,
              lastName: data.lastName || "",
            },
            email: data.email,
          });
          console.log("Synced new user from Auth:", data.email);
        }
        response = { success: true };
      } catch (err) {
        console.error("Failed to sync user:", err.message);
        response = { success: false, error: err.message };
      }
    } else if (queue === "USER_UPDATED") {
      try {
        if (!data.userId || !data.email) {
          throw new AppError("Invalid event data", "BAD_REQUEST", 400);
        }
        const result = await userModel.updateOne(
          { _id: data.userId },
          {
            $set: {
              email: data.email,
              "fullName.firstName": data.firstName,
              "fullName.lastName": data.lastName || "",
            },
          },
          { upsert: true },
        );

        if (result.upsertedCount > 0) {
          console.log("User created via update event:", data.userId);
        } else if (result.modifiedCount > 0) {
          console.log("User updated:", data.userId);
        }
        response = { success: true };
      } catch (err) {
        console.error("Failed to update user:", err.message);
        response = { success: false, error: err.message };
      }
    }

    // Only send a reply if the producer specified a replyTo queue (RPC pattern)
    if (msg.properties && msg.properties.replyTo) {
      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(response)),
        {
          correlationId: msg.properties.correlationId,
        },
      );
    }

    channel.ack(msg);
  });
}

// Initialize the RabbitMQ connection

module.exports = {
  publishToQueue,
  subscribeToQueue,
  connectRabbitMQ,
};
