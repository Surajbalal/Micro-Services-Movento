// controllers/webhook.controller.js
const crypto = require("crypto");
const Payment = require("../models/payment.model");
const { publishEvent } = require("../services/event.service");

exports.handleWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];

  const expected = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expected) {
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;

  if (event === "payment.captured") {
    const paymentData = req.body.payload.payment.entity;

    const payment = await Payment.findOneAndUpdate(
      { orderId: paymentData.order_id },
      {
        status: "paid",
        paymentId: paymentData.id
      },
      { new: true }
    );

    // Publish event to your system
    publishEvent("ride.payment.success", {
      rideId: payment.rideId,
      userId: payment.userId,
      amount: payment.amount
    });
  }

  if (event === "payment.failed") {
    const paymentData = req.body.payload.payment.entity;

      const payment = await Payment.findOneAndUpdate(
      { orderId: paymentData.order_id },
      { status: "failed" },
      { new: true }
    );
 if (!payment) return res.sendStatus(200);

  //  Publish failure event
  publishEvent("ride.payment.failed", {
    rideId: payment.rideId,
    userId: payment.userId,
    amount: payment.amount,
    reason: paymentData.error_description || "Payment failed"
  });
  
  }

  res.status(200).send("OK");
};