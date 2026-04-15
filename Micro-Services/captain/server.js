const express = require("express");
require('dotenv').config();
const http = require("http");
const app = require("./app");
const connect = require('./config/db');
const { connectRabbitMQ, subscribeToQueue } = require('./services/rabbit');


const { initializeSocket } = require('./socket');
const config = require("./config/config");

const server = http.createServer(app);

initializeSocket(server);
async function bootstrap() {
  try {
    await connect(); // connect DB

    await connectRabbitMQ(); // wait for Rabbit

    await subscribeToQueue("new-ride", (data) => {
      console.log("Received:", data);
    });
    await subscribeToQueue("get-captainInTheRadius", (data) => {
      console.log("Received:", data);
    });
    await subscribeToQueue("isBlackList-captain", (data) => {
      console.log("Received:", data);
    });
    await subscribeToQueue("get-captain", (data) => {
      console.log("Received:", data);
    });
    await subscribeToQueue("captain-update");
    await subscribeToQueue("CAPTAIN_CREATED");

    server.listen(config.PORT, () => {
      console.log(`Captain services is running on port ${config.PORT}`);
    });
  } catch (error) {
     console.error("Startup failed:", error);
        process.exit(1);
  }
}
bootstrap();
