// models/payment.model.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  orderId: String,
  paymentId: String,
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created"
  },
  reason: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);