const captainModel = require("../models/captain.model");
const crypto = require("crypto");
const blackListModel = require("../models/blackListToken.model");
const { validationResult } = require("express-validator");
const captainService = require("../services/captain.service");
const emailService = require("../services/email.service");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const sessionModel = require("../models/session.model");
const { generateOtp, getOtpHtml } = require("../utils/util");
const otpModel = require("../models/otp.model");

module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, vehicle } = req.body;

  const isCaptainAlready = await captainModel.findOne({ email });

  if (isCaptainAlready) {
    return res.status(400).json({ message: "Captain already exist" });
  }

  const hashPassword = await captainModel.hashPassword(password);

  const captain = await captainService.createCaptain({
    firstName: fullName.firstName,
    lastName: fullName.lastName,
    email,
    password: hashPassword,
    role: "captain",
    vehicle
  });

  const otp = generateOtp();
  const html = getOtpHtml(otp);
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  
  await captainService.createOtp({
    email,
    otpHash,
    user: captain._id
  });

  await emailService.sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html);

  return res.status(201).json({ captain });
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

  if(!captain.verified){
    return res.status(401).json({message: "Email not verified"})
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const refreshToken = captain.genrateRefreshToken();
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const session = await captainService.createSession({
    user: captain._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  const token = captain.genrateAcessToken(false, session._id);
  
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  return res.status(200).json({ token, captain });
};

module.exports.verifyEmail = async (req, res) => {
  const { otp, email } = req.body;

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpDoc = await otpModel.findOne({ email, otpHash });

  if (!otpDoc) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const captain = await captainModel.findByIdAndUpdate(otpDoc.user, {
    verified: true
  }, { new: true });

  await otpModel.deleteMany({ user: otpDoc.user });

  const refreshToken = captain.genrateRefreshToken();
  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  
  const session = await captainService.createSession({
    user: captain._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  const token = captain.genrateAcessToken(true, session._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json({ 
    message: "Email verified successfully", 
    token,
    captain 
  });
};

module.exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }
  
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.JWT_REFRESH_TOKEN_SECRET);
  } catch(err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoke: false
  });
  
  if (!session) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const captain = await captainModel.findById(decoded._id);

  if (!captain) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const token = captain.genrateAcessToken(false, session._id);
  const newRefreshToken = captain.genrateRefreshToken();
  const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();  
  
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  res.status(200).json({
    message: "Access token refresh successfully",
    token
  });
};

module.exports.logoutCaptain = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not found" });
  }

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoke: false
  });

  if (!session) {
    return res.status(400).json({ message: "Invalid refresh token" });
  }

  session.revoke = true;
  await session.save(); 
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
    decoded = jwt.verify(refreshToken, config.JWT_REFRESH_TOKEN_SECRET);
  } catch(err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  await sessionModel.updateMany({
    user: decoded._id,
    revoke: false
  }, { revoke: true });

  res.clearCookie('refreshToken');

  return res.status(200).json({ message: "Logout from all devices successfully" });
};
