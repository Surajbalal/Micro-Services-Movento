const app = require('./app');
const config = require('./config/config');
const { connectDB } = require("./config/db");
const { connectRabbit } = require("./services/event.service");

connectDB().then(() => {
  console.log("DB Connected");
//   connectRabbit();
});

app.listen(config.PORT,()=>{
    console.log(`Server is running on port ${config.PORT}`);
});