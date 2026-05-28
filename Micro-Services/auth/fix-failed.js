const mongoose = require('mongoose');
const config = require('./config/config');
const Outbox = require('./models/outbox.model');

async function fix() {
  await mongoose.connect(config.DB_CONNECT);
  const result = await Outbox.updateMany(
    { eventType: "CAPTAIN_CREATED", status: "FAILED" },
    { $set: { status: "PENDING", retryCount: 0 } }
  );
  console.log("Fixed outbox events:", result);
  process.exit(0);
}
fix();
