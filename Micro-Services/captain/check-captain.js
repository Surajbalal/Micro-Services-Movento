const mongoose = require('mongoose');
const config = require('./config/config');
const Captain = require('./models/captain.model');

async function check() {
  await mongoose.connect(config.DB_URL || config.DB_CONNECT || "mongodb://localhost:27017/uber-captain");
  const captains = await Captain.find({});
  console.log("Captains in DB:", captains.length);
  if (captains.length > 0) {
    console.log("First captain email:", captains[0].email);
  }
  process.exit(0);
}
check();
