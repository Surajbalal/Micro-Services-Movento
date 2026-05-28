const mongoose = require('mongoose');
const config = require('./config/config');
const Outbox = require('./models/outbox.model');

async function check() {
  await mongoose.connect(config.DB_CONNECT);
  const failed = await Outbox.find({ eventType: "CAPTAIN_CREATED", status: "FAILED" });
  const pending = await Outbox.find({ eventType: "CAPTAIN_CREATED", status: "PENDING" });
  console.log("Failed:", failed.length, "Pending:", pending.length);
  if (failed.length > 0) {
     console.log("Last error:", failed[failed.length - 1].lastError);
  }
  process.exit(0);
}
check();
