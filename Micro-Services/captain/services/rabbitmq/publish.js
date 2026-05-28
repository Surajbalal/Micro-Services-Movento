const { v4: uuidv4 } = require("uuid");

const {
   getChannel,
   getReplyQueue
} = require("../../config/rabbitmq");

const pendingRequests = new Map();

async function startReplyConsumer() {

   const channel = getChannel();

   const replyQueue = getReplyQueue();

   channel.consume(
      replyQueue.queue,

      (msg) => {

         if (!msg) return;

         const correlationId =
            msg.properties.correlationId;

         if (
            pendingRequests.has(correlationId)
         ) {

            const resolve =
               pendingRequests.get(correlationId);

            resolve(
               JSON.parse(msg.content.toString())
            );

            pendingRequests.delete(
               correlationId
            );
         }
      },

      { noAck: true }
   );
}

async function publishToQueue(
   queue,
   message
) {

   const channel = getChannel();

   const correlationId = uuidv4();

   return new Promise((resolve, reject) => {

      pendingRequests.set(
         correlationId,
         resolve
      );

      setTimeout(() => {

         if (
            pendingRequests.has(correlationId)
         ) {

            pendingRequests.delete(
               correlationId
            );

            reject(
               new Error("RPC Timeout")
            );
         }

      }, 5000);

      channel.sendToQueue(
         queue,

         Buffer.from(
            JSON.stringify(message)
         ),

         {
            correlationId,
            replyTo: getReplyQueue().queue,
            persistent: true
         }
      );
   });
}

module.exports = {
   publishToQueue,
   startReplyConsumer
};