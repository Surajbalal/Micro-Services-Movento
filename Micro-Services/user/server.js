require('dotenv').config();
const config = require('./config/config');
const http = require('http');
const app = require('./app');
const connect = require('./config/db');
const { initializeSocket } = require('./socket');
const { connectRabbitMQ, subscribeToQueue } = require('./services/rabbit');

const server = http.createServer(app);




async function bootstrap() {
  try {
    await connectRabbitMQ(); // wait for Rabbit
    
    await connect(); // connect DB
    
    // initializeSocket(server); // Initialize socket.io
    await subscribeToQueue("isBlackList-user");
    await subscribeToQueue("get-user");
    await subscribeToQueue("notification-ride-ended");
    await subscribeToQueue("update-user");
    await subscribeToQueue("USER_CREATED");
    await subscribeToQueue("USER_UPDATED");
    await subscribeToQueue("new-ride", (data) => {
      console.log("Received:", data);
    });
    
    server.listen(config.PORT, () => {
      console.log(`User services is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}
bootstrap();


