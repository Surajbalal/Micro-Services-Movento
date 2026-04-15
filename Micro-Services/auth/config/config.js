require("dotenv").config();
const requiredEnv = [
  "JWT_REFRESH_TOKEN_SECRET",
  "JWT_ACCESS_TOKEN_SECRET",
  "DB_CONNECT",
  "JWT_REFRESH_TOKEN_EXPIRY",
  "JWT_ACCESS_TOKEN_EXPIRY",
  "RABBIT_URL",
  "GOOGLE_USER",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CLIENT_ID",
  "REDIS_HOST",
  "REDIS_PORT",
  "KEY_ID",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined`);
  }
});
const config = {
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  PORT: process.env.PORT,
  DB_CONNECT: process.env.DB_CONNECT,
  JWT_REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_TOKEN_EXPIRY,
  JWT_ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY,
  RABBIT_URL: process.env.RABBIT_URL,
  GOOGLE_USER: process.env.GOOGLE_USER,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  KEY_ID: process.env.KEY_ID,
};
module.exports = config;
