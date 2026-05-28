const express = require("express");
require('dotenv').config();
const http = require("http");
const app = require("./app");
const connect = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbitmq');


const { initializeSocket } = require('./socket');
const config = require("./config/config");
const { startReplyConsumer } = require("./services/rabbitmq/publish");
const registerQueues = require("./services/rabbitmq/registerQueues");

const server = http.createServer(app);

initializeSocket(server);
async function bootstrap() {
  try {
    await connect(); 

    await connectRabbitMQ(); 

    await startReplyConsumer();

    await registerQueues();

    // await subscribeToQueue("new-ride", (data) => {
    //   console.log("Received:", data);
    // });
    // await subscribeToQueue("get-captainInTheRadius", (data) => {
    //   console.log("Received:", data);
    // });
    // await subscribeToQueue("isBlackList-captain", (data) => {
    //   console.log("Received:", data);
    // });
    // await subscribeToQueue("get-captain", (data) => {
    //   console.log("Received:", data);
    // });
    // await subscribeToQueue("captain-update");
    // await subscribeToQueue("CAPTAIN_CREATED");

    server.listen(config.PORT, () => {
      console.log(`Captain services is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}
bootstrap();
