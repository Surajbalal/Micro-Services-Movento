const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const config = require("../config/config");

exports.generateToken = (req, res) => {
  try {
    const { channelName, uid } = req.body;

    if (!channelName) {
      return res.status(400).json({
        success: false,
        message: "channelName is required",
      });
    }

    const role = RtcRole.PUBLISHER;
    const expireTime = 3600;

    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    const token = RtcTokenBuilder.buildTokenWithUid(
      config.AGORA_APP_ID,
      config.AGORA_APP_CERTIFICATE,
      channelName,
      uid || 0,
      role,
      privilegeExpireTime
    );

    return res.json({
      success: true,
      token,
      appId:config.AGORA_APP_ID,
    });
  } catch (error) {
    console.error("Agora Token Error:", error);
    res.status(500).json({
      success: false,
      message: "Token generation failed",
    });
  }
};