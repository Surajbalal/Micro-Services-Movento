const mongoose = require('mongoose');
async function clear() {
  await mongoose.connect('mongodb://localhost:27017/uber-captain');
  const db = mongoose.connection.db;
  await db.collection('captains').deleteMany({});
  console.log("Cleared all captains from DB directly");
  process.exit(0);
}
clear();
