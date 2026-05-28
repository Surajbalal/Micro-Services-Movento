const amqp = require("amqplib");

let channel;
let replyQueue;

async function connectRabbitMQ() {

   const connection =
      await amqp.connect(process.env.RABBIT_URL);

   connection.on("close", () => {
      console.log("RabbitMQ disconnected");
   });

   connection.on("error", (err) => {
      console.log("RabbitMQ Error:", err);
   });

   channel = await connection.createChannel();

   channel.prefetch(10);

   replyQueue = await channel.assertQueue('', {
      exclusive: true
   });

   console.log("RabbitMQ Connected");
}

function getChannel() {
   return channel;
}

function getReplyQueue() {
   return replyQueue;
}

module.exports = {
   connectRabbitMQ,
   getChannel,
   getReplyQueue
};