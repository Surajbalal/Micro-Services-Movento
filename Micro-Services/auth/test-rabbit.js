const { connectRabbitMQ, publishToQueue } = require('./services/rabbit');
const mongoose = require('mongoose');

async function test() {
  await connectRabbitMQ();
  console.log("Publishing...");
  try {
    const res = await publishToQueue("CAPTAIN_CREATED", {
      eventId: new mongoose.Types.ObjectId(), 
      captainId: new mongoose.Types.ObjectId(),
      email: "test@test.com",
      role: "captain",
      firstName: "Test",
      lastName: "User",
      vehicle: {
        color: "Red",
        plate: "MH12",
        capacity: "4",
        vehicleType: "car"
      }
    });
    console.log("Response:", res);
  } catch(e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
}
test();
