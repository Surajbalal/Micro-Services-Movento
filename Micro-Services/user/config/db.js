const mongoose = require('mongoose');
const config = require('./config');
const connectToDb = async() => {

    try {
        await mongoose.connect(config.DB_CONNECT);
        console.log("MongoDB Connected Successfully");
        
    } catch (error) {
         console.error("MongoDB Connection Failed:", error.message);
         process.exit(1);
    }

}
module.exports = connectToDb;