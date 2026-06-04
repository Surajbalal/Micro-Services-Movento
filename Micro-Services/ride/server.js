require('dotenv').config();
const port = process.env.PORT;
const http = require('http');
const app = require('./app');
const connect = require('./db/db');
const { initializeSocket } = require('./socket/socket');
const { connectRabbitMQ, subscribeToQueue } = require('./services/rabbit');


const server = http.createServer(app);

// Initialize socket.io
async function bootstrap() {
    try {
     await  initializeSocket(server);
    await connect(); // connect DB

    await connectRabbitMQ(); // wait for Rabbit
    await subscribeToQueue("ride-payment-success", (data) => {
      console.log("Received ride-payment-success:", data);
    });
    await subscribeToQueue("ride-payment-failed")
    // await subscribeToQueue("new-ride", (data) => {
    //   console.log("Received:", data);
    // });

   server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
  } catch (error) {
     console.error("Startup failed:", error);
        process.exit(1);
  }
}
bootstrap();

