const express = require("express");
const Razorpay = require("razorpay");
const path = require("path");
const {
  validateWebHookSignature,
} = require("./razorpay/dist/utils/razorpay-utils");

const config = require("./config/config");

const app = express();

module.exports = app;
