const captainModel = require("../models/captain.model");
const crypto = require("crypto");
const blackListModel = require("../models/blackListToken.model");
const { validationResult } = require("express-validator");
const captainService = require("../services/captain.service");
const emailService = require("../services/email.service");
const jwt = require("jsonwebtoken");
const sessionModel = require("../models/session.model");
const { generateOtp, getOtpHtml } = require("../utils/util");
const otpModel = require("../models/otp.model");
const { REFRESH_TOKEN_COOKIE_OPTIONS } = require("../config/cookieOptions");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const { publicKey } = require("../config/keys");

module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, vehicle } = req.body;

  const existingCaptain = await captainModel.findOne({ email }).lean();

  const hashPassword = await captainModel.hashPassword(password);

  let captain;

  if (existingCaptain) {
    if (existingCaptain.verified) {
      return res.status(400).json({ message: "Captain already exists" });
    }
    console.log("pipline test4");

    // update unverified captain (re-registration)
    captain = await captainService.updateCaptain({
      email,
      password: hashPassword,
      firstName: fullName.firstName,
      lastName: fullName.lastName,
      vehicle,
    });
  } else {
    // create new captain
    captain = await captainService.createCaptain({
      firstName: fullName.firstName,
      lastName: fullName.lastName,
      email,
      password: hashPassword,
      role: "captain",
      vehicle,
    });
  }

  const otp = generateOtp();
  const html = getOtpHtml(otp);
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  await captainService.createOtp({
    email,
    otpHash,
    user: captain._id,
  });

  await emailService.sendEmail(email, "OTP Verification", `OTP: ${otp}`, html);

  return res.status(200).json({ message: "OTP sent successfully" });
};

module.exports.captainLogin = async (req, res, next) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const captain = await captainModel.findOne({ email }).select("+password");

  if (!captain) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!captain.verified) {
    return res.status(401).json({ message: "Email not verified" });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const session = await captainService.createSession({
    user: captain._id,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const refreshToken = generateRefreshToken({ user: captain, sessionId: session._id });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  session.refreshTokenHash = refreshTokenHash;
  await session.save();

  const token = generateAccessToken({ user: captain, isNewUser: false, sessionId: session._id });

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  return res.status(200).json({ token, captain });
};

module.exports.verifyEmail = async (req, res) => {
  const { otp, email } = req.body;

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpDoc = await otpModel.findOne({ email, otpHash });

  if (!otpDoc) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const captain = await captainModel.findByIdAndUpdate(
    otpDoc.user,
    { verified: true },
    { new: true }
  );

  await otpModel.deleteMany({ user: otpDoc.user });

  const refreshToken = generateRefreshToken({ user: captain, sessionId: undefined });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await captainService.createSession({
    user: captain._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const token = generateAccessToken({
    user: captain,
    isNewUser: true,
    sessionId: session._id,
  });

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  return res.status(200).json({
    message: "Email verified successfully",
    token,
    captain,
  });
};

module.exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, publicKey, {
      algorithms: ["RS256"],
      issuer: "auth-service",
      audience: "auth-service",
    });

    const { sessionId, sub } = decoded;
    if (!sessionId) {
      return res.status(401).json({ message: "Invalid token (no session)" });
    }

    const session = await sessionModel.findById(String(sessionId));

    if (!session || session.revoke) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Session expired or revoked" });
    }

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Reuse Detection
    if (session.refreshTokenHash !== refreshTokenHash) {
      await sessionModel.updateMany(
        { user: sub },
        { $set: { revoke: true } }
      );
      res.clearCookie("refreshToken");
      return res
        .status(401)
        .json({ message: "Security issue detected. Please login again." });
    }

    const captain = await captainModel.findById(sub).lean();

    if (!captain) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const token = generateAccessToken({ user: captain, sessionId: session._id });
    const newRefreshToken = generateRefreshToken({ user: captain, sessionId: session._id });
    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Access token refresh successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

module.exports.logoutCaptain = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not found" });
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoke: false,
  });

  if (!session) {
    return res.status(400).json({ message: "Invalid refresh token" });
  }

  // Revoke the refresh session
  session.revoke = true;
  await session.save();

  // Blacklist the access token so it's immediately invalid (not just after 15min expiry)
  const accessToken = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (accessToken) {
    await blackListModel.create({
      token: accessToken,
      userId: req.user?._id,
      role: "captain",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min = access token TTL
    });
  }

  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout successfully" });
};

module.exports.logoutAllCaptain = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not found" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, publicKey, {
      algorithms: ["RS256"],
      issuer: "auth-service",
      audience: "auth-service",
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  // Revoke all sessions for this captain
  await sessionModel.updateMany(
    { user: decoded.sub, revoke: false },
    { $set: { revoke: true } }
  );

  // Blacklist the current access token so it's immediately invalid
  const accessToken = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (accessToken) {
    await blackListModel.create({
      token: accessToken,
      userId: req.user?._id,
      role: "captain",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
  }

  res.clearCookie("refreshToken");

  return res.status(200).json({ message: "Logout from all devices successfully" });
};
