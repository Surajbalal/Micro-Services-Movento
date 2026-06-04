import React from "react";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const PaymentButton = ({ rideId, userId, amount, paymentStatus }) => {

  // Load Razorpay SDK
  const loadRazorpay = () => {
    return new Promise((resolve) => {

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    console.log("KEY:", import.meta.env.VITE_RAZORPAY_KEY_ID);
    const isLoaded = await loadRazorpay();
    console.log(userId,rideId,amount)
    if (!isLoaded) {
      alert("Razorpay SDK failed to load");
      return;
    }

    try {
        // API call for creating an order
      const { data } = await axiosInstance.post(
        "/api/payment/create-order",
        {
          amount,
          rideId,
          userId,
        }
      );

      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "Ride Payment",
        description: "Complete your ride payment",
        order_id: data.order.id,

        handler: function (response) {
          console.log("Payment Success:", response);
          // alert("Payment processing...");
        },

        prefill: {
          name: "User",
          email: "user@email.com",
          contact: "9999999999",
        },
    method: {
  upi: true,
},
        theme: {
          color: "#3399cc",
        },
      };

      // Create Razorpay instance
      const rzp = new window.Razorpay(options);

      // Handle failure event
      rzp.on("payment.failed", function (response) {
        console.log("Payment Failed:", response.error);
        alert("Payment failed");
      });

      // Open payment popup
      rzp.open();

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <button disabled={paymentStatus === "paid"} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all font-semibold text-sm text-white focus:outline-none shadow-sm" onClick={handlePayment}>
      {paymentStatus === "paid" ? "Paid" : "Pay ₹" + amount}
    </button>
  );
};

export default PaymentButton;