require("dotenv").config();
const requiredEnv = [
  "PORT",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "DB_CONNECT",
  "RABBIT_URL",
  "RAZORPAY_WEBHOOK_SECRET",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined`);
  }
});
const config = {
  PORT: process.env.PORT,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  DB_CONNECT: process.env.DB_CONNECT,
  RABBIT_URL: process.env.RABBIT_URL,
  RAZORPAY_WEBHOOK_SECRET:process.env.RAZORPAY_WEBHOOK_SECRET,
};
module.exports = config;
