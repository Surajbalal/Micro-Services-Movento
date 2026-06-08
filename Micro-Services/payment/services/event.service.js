const { resolve } = require("path");
const ampq = require('amqplib');
const { v4: uuidv4 } = require("uuid");
const {RABBIT_URL} = require("../config/config");
const paymentModel = require("../models/payment.model");
let channel; 


async function connectToRabbitMQ(){

  try {

    const connection = await ampq.connect(RABBIT_URL);

    channel = await connection.createChannel();

    console.log("connected to rabbitmq")
    
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
}

async function publishToQueue (queue, message){
  if (!channel) return console.error("No channel");
  console.log("publishToQueue hit",queue,message)
  const correlationId = uuidv4();
  const replyQueue = await channel.assertQueue("",{

  exclusive:true,
  })

  const responsePromise = new Promise((resolve)=>{
    channel.consume(
      replyQueue.queue,
      (msg)=>{
        if(msg.correlationId === correlationId){
          const response = JSON.parse(msg.content.toString())
          channel.cancel(msg.fields.consumerTag).then(()=>{
            channel.deleteQueue(replyQueue.queue);
            resolve(response)
          }).catch(err => {
            console.error("Error cancelling consumer or deleting queue:", err);
            resolve(response);
          });
         
        } 
      },
      {noAck:true}
    )
  })




  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message)),
    {
      correlationId,
      replyQueue
    }
  );

};

async function subscribeToQueue(queue) {
 if (!channel) {
        throw new Error('RabbitMQ channel is not initialized');
    }
await channel.assertQueue(queue)
    try{
      channel.consume(queue,async(msg)=>{
        if(!msg) return;

          const data = JSON.parse(msg.content.toString());

          if(queue === "get-payment-status"){
            const response = await paymentModel.findOne({rideId:data.rideId}).select("status").lean();

            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(response)),
              {
                correlationId: msg.properties.correlationId
              }
            )

            channel.ack(msg)
            
          }

      })

    }
    catch(err){
       throw new Error("Error subscribing to queue")
    }

}

module.exports = {connectToRabbitMQ,
  publishToQueue,
  subscribeToQueue}