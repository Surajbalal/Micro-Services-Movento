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

module.exports.updateCaptain = async ({ email, password, firstName, lastName, vehicle }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const captain = await Captain.findOne({ email }).session(session);

    if (!captain) {
      throw new Error("Captain not found");
    }

    if (captain.verified) {
      throw new Error("Captain already verified");
    }

    // update fields
    if (firstName) captain.firstName = firstName;
    if (lastName) captain.lastName = lastName;
    if (password) captain.password = password;
    if (vehicle) captain.vehicle = vehicle;

    await captain.save({ session });

    // notify captain-service via outbox
    await Outbox.create([{
      eventType: "captain-update",
      payload: {
        eventId: new mongoose.Types.ObjectId(),
        captainId: captain._id,
        email: captain.email,
        firstName,
        lastName,
        vehicle,
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
  if (!user || !ip || !userAgent) {
    throw new Error("Missing required fields for session creation");
  }
  const session = await sessionModel.create({
    user: user._id || user,
    ip,
    userAgent,
    ...(refreshTokenHash && { refreshTokenHash }),
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
