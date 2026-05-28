const mongoose = require('mongoose');
const config = require('./config/config');

async function fix() {
  await mongoose.connect(config.DB_CONNECT);
  const CaptainModel = require('./models/captain.model.js');
  const captains = await CaptainModel.find({});
  console.log("Captains in Atlas DB:", captains.length);
  if (captains.length > 0) {
     console.log("Emails:", captains.map(c => c.email));
  }
  process.exit(0);
}
fix();
