
let channel; 

exports.publishEvent = (queue, message) => {
  if (!channel) return console.error("No channel");

  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message))
  );
};