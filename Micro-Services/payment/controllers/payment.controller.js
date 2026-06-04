// controllers/payment.controller.js
const razorpay = require("../config/razorpay");
const Payment = require("../models/payment.model");
const { publishToQueue } = require("../services/event.service");

exports.createOrder = async (req, res) => {
  const { amount, rideId, userId } = req.body;
console.log("check request body", req.body);
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  });

  // Save in DB
  const payment = await Payment.create({
    rideId,
    userId,
    amount,
    orderId: order.id,
  });
   // Publish event to your system
    publishToQueue("ride-payment-success", {
      rideId: payment.rideId,
      userId: payment.userId,
      amount: payment.amount
    });



  res.json({
    success: true,
    order,
    paymentId: payment._id,
  });
};
