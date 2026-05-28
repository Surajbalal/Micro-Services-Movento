// routes/payment.routes.js
const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/payment.controller");
const { handleWebhook } = require("../controllers/webhook.controller");

router.post("/create-order", createOrder);
router.post("/webhook", handleWebhook);

module.exports = router;