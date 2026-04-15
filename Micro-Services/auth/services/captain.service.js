const mongoose = require("mongoose");
const Captain = require("../models/captain.model");
const Outbox = require("../models/outbox.model");
const sessionModel = require("../models/session.model");
const otpModel = require("../models/otp.model");

module.exports.createCaptain = async ({ email, password, role, firstName, lastName, vehicle }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [captain] = await Captain.create([{
      email,
      password,
      role: role || "captain"
    }], { session });

    await Outbox.create([{
      eventType: "CAPTAIN_CREATED",
      payload: {
        eventId: new mongoose.Types.ObjectId(), 
        captainId: captain._id,
        email: captain.email,
        role: captain.role,
        firstName,
        lastName,
        vehicle
      }
    }], { session });

    await session.commitTransaction();
    return captain;

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};

module.exports.createSession = async ({ user, refreshTokenHash, ip, userAgent }) => {
  if (!user || !refreshTokenHash || !ip || !userAgent) {
    throw new Error("Missing required fields for session creation");
  }
  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip,
    userAgent
  });
  return session;
};

module.exports.createOtp = async ({ email, otpHash, user }) => {
  if (!email || !otpHash || !user) {
    throw new Error("Missing required fields for otp creation");
  }
  const otp = await otpModel.create({
    email,
    otpHash,
    user
  });
  return otp;
};
