const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const config = require("../config/config");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

exports.generateToken = asyncHandler(async (req, res, next) => {
  const { channelName, uid } = req.body;

  if (!channelName) {
    throw new AppError("channelName is required", "BAD_REQUEST", 400);
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
    appId: config.AGORA_APP_ID,
  });
});