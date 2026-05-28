const mongoose = require('mongoose');
const config = require('./config/config');

async function clear() {
  await mongoose.connect(config.DB_CONNECT);
  const CaptainModel = require('./models/captain.model.js');
  await CaptainModel.deleteMany({});
  console.log("Successfully cleared Captain Atlas DB!");
  process.exit(0);
}
clear();
