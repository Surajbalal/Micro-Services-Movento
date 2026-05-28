const express = require("express");
const paymentroutes = require("./routes/payment.routes.js");

const config = require("./config/config");

const app = express();
app.use(express.json());
app.use("/", paymentroutes);
module.exports = app;
