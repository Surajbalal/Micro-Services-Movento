const twilio = require("twilio");
const config = require("../config/config");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ✅ 1. Initiate Call (User clicks "Call Driver")
exports.initiateCall = asyncHandler(async (req, res, next) => {
  const { userNumber, captainNumber } = req.body;

  if (!userNumber || !captainNumber) {
    throw new AppError("Both numbers are required", "BAD_REQUEST", 400);
  }

  const call = await client.calls.create({
    url: `${config.BASE_URL}/api/call/connect?to=${captainNumber}`,
    to: userNumber, // first call user
    from: process.env.TWILIO_PHONE_NUMBER,

    statusCallback: `${process.env.BASE_URL}/api/call/status`,
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
  });

  return res.json({
    success: true,
    message: "Call initiated",
    callSid: call.sid,
  });
});

// ✅ 2. Connect Call (TwiML)
exports.connectCall = asyncHandler(async (req, res, next) => {
  const captainNumber = req.query.to;

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.dial(captainNumber); // 🔥 connect to captain

  res.type("text/xml");
  res.send(twiml.toString());
});

// ✅ 3. Call Status Webhook
exports.callStatus = asyncHandler(async (req, res, next) => {
  console.log("📞 Call Status:", req.body);

  // You can store this in DB later

  res.sendStatus(200);
});