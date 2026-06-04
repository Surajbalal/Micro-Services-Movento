const amqp = require("amqplib");

let channel;
let replyQueue;
let connection;

async function connectRabbitMQ() {
   try {

    connection =
      await amqp.connect(process.env.RABBIT_URL);

   connection.on("close", () => {
      console.log("RabbitMQ disconnected");

      setTimeout(
         connectRabbitMQ,
         5000
      )
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

      
   } catch (error) {

      console.log("RabbitMQ Connection Error:", error);
      setTimeout(
         connectRabbitMQ,
         5000
      )
      
   }

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