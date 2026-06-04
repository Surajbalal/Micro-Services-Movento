const rideModel = require("../models/ride.model");
const { sendMessageToSocketId } = require("../socket/socket");
const mapService = require("./maps.service");
const crypto = require("crypto");
const { publishToQueue, publishEvent } = require("./rabbit");
const AppError = require("../utils/appError");
const CaptainDailyStatsModel = require("../models/CaptainDailyStats.model");
const mongoose = require("mongoose");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
//
module.exports.generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

module.exports.getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new AppError(
      "Pickup and destination are required",
      "BAD_REQUEST",
      400,
    );
  }

  const destinationTime = await mapService.getDistanceTime(pickup, destination);
  console.log(destinationTime);
  if (destinationTime.distance.value == 0) {
    throw new AppError(
      "Pickup and destination must be different locations",
      "SAME_LOCATION",
      400,
    );
  }
  const distanceInKm = destinationTime.distance.value / 1000;
  const timeInMin = destinationTime.duration.value / 60;

  const rates = {
    car: { base: 50, perKm: 12, perMin: 2 },
    auto: { base: 30, perKm: 8, perMin: 1.5 },
    motorcycle: { base: 20, perKm: 6, perMin: 1 },
  };

  function calculateFare(rate) {
    return Math.round(
      rate.base + distanceInKm * rate.perKm + timeInMin * rate.perMin,
    );
  }

  return {
    car: calculateFare(rates.car),
    auto: calculateFare(rates.auto),
    motorcycle: calculateFare(rates.motorcycle),
  };
};

module.exports.create = async ({
  user,
  pickup,
  destination,
  vehicleType,
  distance,
  duration,
}) => {
  console.log("user", user);
  console.log("pickup", pickup);
  console.log("destination", destination);
  console.log("vehicleType", vehicleType);
  console.log("distance", distance);
  console.log("duration", duration);
  if (
    !user ||
    !pickup ||
    !destination ||
    !vehicleType ||
    !distance ||
    !duration
  ) {
    throw new AppError("All fields are required", "BAD_REQUEST", 400);
  }
  const fare = await this.getFare(pickup.address, destination.address);

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    distance,
    duration,
    fare: fare[vehicleType],
    otp: this.generateOtp(),
  });
  console.log("check is this returning full ride detail or not", ride);
  return ride;
};
module.exports.confirmRide = async (rideId, captainId) => {
  if (!rideId || !captainId) {
    throw new AppError("RideId and captainId is required", "BAD_REQUEST", 400);
  }

  const ride = await rideModel
    .findOneAndUpdate(
      { _id: rideId },
      { status: "accepted", captain: captainId },
      { new: true },
    )
    // .populate('user')
    // .populate('captain')
    .select("+otp");

  // const ride = rideModel.findOne({_id: rideId}).populate('user');

  if (!ride) {
    throw new AppError("Ride not found", "NOT_FOUND", 404);
  }
  // update captain isAvailable to false
  await publishToQueue("captain-update", {
    _id: ride.captain,
    updateData: { isAvailable: false },
  });

  // fetch user and captain
  const captain = await publishToQueue("get-captain", { _id: ride.captain });
  const user = await publishToQueue("get-user", { _id: ride.user });

  const rideData = ride.toObject();
  const result = {
    ...rideData,
    user,
    captain,
  };
  return result;
};
module.exports.startRide = async ({ rideId, otp }) => {
  if (!rideId || !otp) {
    throw new AppError("rideId and otp are required", "BAD_REQUEST", 400);
  }

  const ride = await rideModel.findOne({ _id: rideId }).select("+otp");

  if (!ride) {
    throw new AppError("Ride not found", "NOT_FOUND", 404);
  }

  if (ride.status !== "accepted") {
    throw new AppError("Ride not accepted", "INVALID_STATE", 400);
  }

  if (ride.otp !== otp) {
    throw new AppError("Invalid otp", "UNAUTHORIZED", 401);
  }

  // Fetch user & captain from microservice
  const user = await publishToQueue("get-user", { _id: ride.user });
  const captain = await publishToQueue("get-captain", { _id: ride.captain });

  // Update ride status
  ride.status = "ongoing";
  await ride.save();

  // Convert mongoose document to object
  const rideData = ride.toObject();

  // Attach user and captain
  rideData.user = user;
  rideData.captain = captain;
  console.log(`--------------user:${user._id}-------------------`)

  // Send updated ride with full data
  sendMessageToSocketId(`user:${user._id}`, "ride-started", rideData);

  return rideData;
};
module.exports.endRide = async ({ rideId, captain }) => {
  const session = await mongoose.startSession();
  try {
    if (!rideId) {
      throw new AppError("RideId is required", "BAD_REQUEST", 400);
    }

    session.startTransaction();
    const ride = await rideModel
      .findOne({ _id: rideId, captain: captain._id })
      .session(session);

    if (!ride) {
      throw new AppError("Ride not found", "NOT_FOUND", 404);
    }

    if (ride.payment.status !== "paid") {
      throw new AppError("Payment not completed", "INVALID_STATE", 400);
    }

    if (ride.status !== "ongoing") {
      throw new AppError("Ride not ongoing", "INVALID_STATE", 400);
    }

    ride.status = "completed";
    await ride.save({ session });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("check is this working or not", {
      captainId: captain._id,
      date: today,
    });
    await CaptainDailyStatsModel.updateOne(
      { captainId: captain._id, date: today },
      {
        $inc: {
          totalRides: 1,
          totalEarnings: ride.fare,
          totalDistanceMeters: ride.distance,
        },
      },
      { upsert: true, session },
    );

    await session.commitTransaction();
    session.endSession();
    publishToQueue("captain-update", {
      _id: ride.captain,
      updateData: { isAvailable: true },
    }).catch((err) => {
      console.error("Queue error:", err);
    });
    // publishEvent("notification-ride-ended", {
    //   captainId: captain._id,
    //   userId: ride.user,
    //   rideId: ride._id,
    //   message: `your ride has been completed successfully`,
    // });

    sendMessageToSocketId(`captain:${captain._id}`, "ride-ended", {
      rideId: ride._id,
      message: `your ride has been completed successfully`,
    });
    sendMessageToSocketId(`user:${ride.user}`, "ride-ended", {
      rideId: ride._id,
      message: `your ride has been completed successfully`,
    });

    return ride;
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    if(error instanceof AppError){
      throw error;
    }
    throw new AppError("Failed to end ride", "INTERNAL_SERVER_ERROR", 500);
  } finally {
    session.endSession();
  }
};
module.exports.getCaptainInTheRadius = async (lat, lng, vehicleType) => {
  const MAX_RETRIES = 3;

  for (let i = 0; i < MAX_RETRIES; i++) {
    const captains = await mapService.getCaptainInTheRadius(
      lat,
      lng,
      10,
      vehicleType,
    );

    if (captains.length > 0) {
      return captains;
    }

    await delay(1000 * Math.pow(2, i));
  }

  throw new AppError(
    "No captains available nearby. Please try again later.",
    "NO_CAPTAIN",
    404,
  );
};
module.exports.getRide = async (query) => {
  const rideData = await rideModel
    .findOne({
      $or: [{ user: query.userId }, { captain: query.captainId }],
      status: { $in: ["accepted", "ongoing"] },
    })
    .select("+otp")
    .lean();
  if (!rideData) {
    throw new AppError("Ride not found", "NOT_FOUND", 404);
  }
  let ride;
  if (!query.captainId) {
    const captain = await publishToQueue("get-captain", {
      _id: rideData.captain,
    });
    ride = {
      ...rideData,
      captain,
    };
  } else {
    const user = await publishToQueue("get-user", { _id: rideData.user });
    ride = {
      ...rideData,
      user,
    };
  }
  return ride;
};
module.exports.cancelRide = async ({
  rideId,
  reason,
  note,
  cancelledBy,
  cancellerData,
}) => {
  if (!rideId) {
    throw new AppError("Ride ID is required", "INVALID_REQUEST", 400);
  }
  const ride = await rideModel.findById(rideId).lean();
  if (!ride) {
    throw new AppError("Ride not found", "NOT_FOUND", 404);
  }

  let captain = null;
  let user = null;

  // Validation check
  if (
    cancelledBy === "user" &&
    ride.user.toString() !== cancellerData._id.toString()
  ) {
    throw new AppError(
      "You are not authorized to cancel this ride",
      "UNAUTHORIZED",
      403,
    );
  } else if (
    (console.log(cancelledBy),
    console.log(ride.captain),
    console.log(cancellerData._id.toString()),
    cancelledBy === "captain" &&
      ride.captain.toString() !== cancellerData._id.toString())
  ) {
    throw new AppError(
      "You are not authorized to cancel this ride",
      "UNAUTHORIZED",
      403,
    );
  }

  const updateRide = await rideModel.findOneAndUpdate(
    {
      _id: rideId,
      status: { $in: ["pending", "accepted"] },
    },
    {
      status: "cancelled",
      cancellation: {
        reason: reason || "other",
        note: note || "",
        cancelledBy: cancelledBy,
        cancelledAt: new Date(),
      },
    },
    { new: true },
  );
  if (!updateRide) {
    throw new AppError("Ride cannot be cancelled", "INVALID_STATUS", 400);
  }

  // Fetch data from microservices
  if (cancelledBy === "user") {
    captain = await publishToQueue("get-captain", { _id: updateRide.captain });
  } else if (cancelledBy === "captain") {
    user = await publishToQueue("get-user", { _id: updateRide.user });
  }

  // notify canceller
  if (cancellerData?.socketId) {
    const socketKey =
      cancelledBy === "user"
        ? `user:${cancellerData._id}`
        : `captain:${cancellerData._id}`;
    sendMessageToSocketId(socketKey, "ride-cancelled", {
      rideId,
      reason,
      note,
    });
  }

  // notify other party
  const other = cancelledBy === "user" ? captain : user;

  if (other?.socketId) {
    const socketKey =
      cancelledBy === "user" ? `captain:${other._id}` : `user:${other._id}`;
    sendMessageToSocketId(socketKey, "ride-cancelled", {
      rideId,
      reason,
      note,
    });
  }
  publishToQueue("ride-cancelled", {
    rideId: updateRide._id,
    userId: updateRide.user,
    captainId: updateRide.captain,
    cancelledBy,
    reason,
  });
  return {
    message: "Ride cancelled successfully",
    updateRide,
  };
};

module.exports.rateRide = async ({ rideId, rating, feedback, userId }) => {
  const ride = await rideModel.findOne({ _id: rideId, user: userId });
  if (!ride) throw new AppError("Ride not found", "NOT_FOUND", 404);
  if (ride.status !== "completed")
    throw new AppError(
      "Only completed rides can be rated",
      "INVALID_STATE",
      400,
    );
  if (ride.rating) throw new AppError("Ride already rated", "BAD_REQUEST", 400);

  ride.rating = rating;
  if (feedback) ride.feedback = feedback;
  await ride.save();
  const rideDate = new Date(ride.createdAt);
  rideDate.setHours(0, 0, 0, 0);

  await CaptainDailyStatsModel.updateOne(
    { captainId: ride.captain, date: rideDate },
    {
      $inc: {
        totalRatingPoints: rating,
        ratedRides: 1,
      },
    },
    { upsert: true },
  );

  return ride;
};

module.exports.getCaptainStats = async (captainId) => {
  if (!captainId)
    throw new AppError("CaptainId is required", "BAD_REQUEST", 400);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await CaptainDailyStatsModel.findOne({
    captainId,
    date: today,
  }).lean();
  if (!stats)
    throw new AppError("No stats found for this captain", "NOT_FOUND", 404);
  return stats;
};
