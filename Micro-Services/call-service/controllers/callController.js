const twilio = require("twilio");
const config = require("../config/config");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ✅ 1. Initiate Call (User clicks "Call Driver")
exports.initiateCall = async (req, res) => {
  const { userNumber, captainNumber } = req.body;

  if (!userNumber || !captainNumber) {
    return res.status(400).json({
      success: false,
      message: "Both numbers are required",
    });
  }

  try {
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
  } catch (error) {
    console.error("Call Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ 2. Connect Call (TwiML)
exports.connectCall = (req, res) => {
  const captainNumber = req.query.to;

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.dial(captainNumber); // 🔥 connect to captain

  res.type("text/xml");
  res.send(twiml.toString());
};

// ✅ 3. Call Status Webhook
exports.callStatus = (req, res) => {
  console.log("📞 Call Status:", req.body);

  // You can store this in DB later

  res.sendStatus(200);
};