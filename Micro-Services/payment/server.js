const app = require('./app');
const config = require('./config/config');
const { connectDB } = require("./config/db");
const { connectToRabbitMQ, subscribeToQueue } = require("./services/event.service");

connectDB().then(async () => {
  console.log("DB Connected");
  await connectToRabbitMQ();
  await subscribeToQueue("get-payment-status",(msg)=>{
    console.log(msg,"get-payment-status");
  });
});


app.listen(config.PORT,()=>{
    console.log(`Server is running on port ${config.PORT}`);
});