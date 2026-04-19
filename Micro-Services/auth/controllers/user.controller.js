const userModel = require("../models/user.model");
const crypto = require("crypto");
const blackListModel = require("../models/blackListToken.model");
const { validationResult } = require("express-validator");
const userService = require("../services/user.service");
const emailService = require("../services/email.service");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const sessionModel = require("../models/session.model");
const { generateOtp, getOtpHtml } = require("../utils/util");
const { REFRESH_TOKEN_COOKIE_OPTIONS } = require("../config/cookieOptions");
const otpModel = require("../models/otp.model");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const { publicKey } = require("../config/keys");
module.exports.registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  const existingUser = await userModel.findOne({ email }).lean();

  const hashPassword = await userModel.hashPassword(password);

  let user;

  if (existingUser) {
    if (existingUser.verified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // update unverified user
    user = await userService.updateUser({
      email,
      password: hashPassword,
      firstName: fullName.firstName,
      lastName: fullName.lastName,
    });
  } else {
    // create new user
    user = await userService.createUser({
      firstName: fullName.firstName,
      lastName: fullName.lastName,
      email,
      password: hashPassword,
      role: "user",
    });
  }

  const otp = generateOtp();
  const html = getOtpHtml(otp);
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  await userService.createOtp({
    email,
    otpHash,
    user: user._id,
  });

  await emailService.sendEmail(email, "OTP Verification", `OTP: ${otp}`, html);

  return res.status(200).json({ message: "OTP sent successfully" });
};
module.exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user.verified) {
    return res.status(401).json({ message: "Email not verified" });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const session = await userService.createSession({
    user: user._id,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

    const refreshToken = generateRefreshToken({user, sessionId:session._id});

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

    session.refreshTokenHash = refreshTokenHash;
    session.save();
    

console.log(session,"session id");
  const token = generateAccessToken({user, isNewUser: false , sessionId: session._id });
  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  return res.status(200).json({ token, user });
};

module.exports.refreshToken = async (req, res) => {
  // ── DEBUG (remove after fixing) ──────────────────────────────────────────
  console.log("=== REFRESH TOKEN ===");
  console.log("req.headers.cookie :", req.headers.cookie);
  console.log("req.cookies        :", req.cookies);
  // ─────────────────────────────────────────────────────────────────────────
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }
  let decoded;
  try {
    decoded = jwt.verify(refreshToken,publicKey, {
      algorithms: ["RS256"],
      issuer: "auth-service",
      audience: "auth-service",
    });
    console.log("hello");

  const { sessionId, sub } = decoded;
  if (!sessionId) {
    return res.status(401).json({ message: "Invalid token (no session)" });
  }

  // Searching session in db
  console.log(sessionId,"hello");
  const session = await sessionModel.findById(sessionId);
  
    if (!session || session.revoke) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Session expired or revoked" });
    }

  const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    // Reuse Detection
  if (session.refreshTokenHash !== refreshTokenHash) {
    await sessionModel.updateMany(
      {user: sub},
      {$set: { revoke: true }}
    );
    res.clearCookie("refreshToken");
    return res.status(401).json({message: "Security issue detected. Please login again."});
  }


  const user = await userModel.findById(sub).lean();

  if (!user) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const token = generateAccessToken({user, sessionId: session._id });
  const newRefreshToken = generateRefreshToken({user,sessionId:session._id});
  const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();
  res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
   return res.status(200).json({
    message: "Access token refresh successfully",
    token,
  });
    
  } catch (error) {
        // res.clearCookie("refreshToken");
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
   
};
module.exports.logoutUser = async (req, res) => {
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
      role: "user",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min = access token TTL
    });
  }

  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout successfully" });
};
module.exports.logoutAllUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not found" });
  }

  // Revoke all sessions for this user
  await sessionModel.updateMany(
    { user: req.user._id, revoke: false },
    { $set: { revoke: true } },
  );

  // Blacklist the current access token so it's immediately invalid
  const accessToken = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (accessToken) {
    await blackListModel.create({
      token: accessToken,
      userId: req.user?._id,
      role: "user",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
  }

  res.clearCookie("refreshToken");

  return res
    .status(200)
    .json({ message: "Logout from all devices successfully" });
};
module.exports.verifyEmail = async (req, res) => {
  const { otp, email } = req.body;

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpDoc = await otpModel.findOne({
    email,
    otpHash,
  });

  const user = await userModel.findByIdAndUpdate(otpDoc.user, {
    verified: true,
  });

  await otpModel.deleteMany({
    user: otpDoc.user,
  });

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await userService.createSession({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  const token = generateAccessToken({
    isNewUser: true,
    sessionId: session._id,
  });

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  return res
    .status(200)
    .json({ message: "Email verified successfully", token, user });
};
