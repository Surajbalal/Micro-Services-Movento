const { getChannel } =
require("../../config/rabbitmq");

const queues =
require("../../routes/rabbitmq.routes");

async function registerQueues() {
            
   const channel = getChannel();

   for (const [queue, handler]
      of Object.entries(queues)) {

      await channel.assertQueue(
         queue,
         {
            durable: true
         }
      );

      channel.consume(
         queue,

         async (msg) => {

            try {

               const data = JSON.parse(
                  msg.content.toString()
               );

               const response =
                  await handler(data);

               if (msg.properties.replyTo) {

                  channel.sendToQueue(

                     msg.properties.replyTo,

                     Buffer.from(
                        JSON.stringify(
                           response || {}
                        )
                     ),

                     {
                        correlationId:
                           msg.properties.correlationId
                     }
                  );
               }

               channel.ack(msg);

            } catch (err) {

               console.log(
                  "Queue Error:",
                  err
               );

               channel.ack(msg);
            }

         }
      );

      console.log(
         `Listening: ${queue}`
      );
   }
}

module.exports = registerQueues;