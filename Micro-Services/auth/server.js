require('dotenv').config();
const connectToDb = require('./config/db');
const http = require('http');
const app = require('./app');

const server = http.createServer(app);

const config = require('./config/config');
const { connectRabbitMQ ,subscribeToQueue} = require('./services/rabbit');
const { startOutboxWorker } = require('./worker/outbox.worker');

const bootstrap = async () =>{

   try {
     // Connect to database and queues centrally
     await connectToDb();
     await connectRabbitMQ();
     
     // Start the background poller now that queues are ready
     startOutboxWorker();
    await subscribeToQueue("isBlackList-user")
     await server.listen(config.PORT,()=>{
       console.log(`server is running on PORT: ${config.PORT}`)
     })
     
   } catch (error) {
     console.error("Startup failed:", error);
        process.exit(1);
  }
}
bootstrap();

    