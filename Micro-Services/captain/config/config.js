require("dotenv").config();
const requiredEnv = [
  "RABBIT_URL",
  "DB_CONNECT",
  "PORT"
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined`);
  }
});
const config = {
  
  RABBIT_URL: process.env.RABBIT_URL,
  DB_CONNECT: process.env.DB_CONNECT,
  PORT: process.env.PORT,
};
module.exports = config;
