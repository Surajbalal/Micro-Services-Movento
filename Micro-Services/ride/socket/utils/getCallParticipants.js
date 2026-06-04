const validateRideAccess = require("./validateRideAccess");

const { publishToQueue } = require("../../services/rabbit");
const rideModel = require("../../models/ride.model");

async function getCallParticipants(rideId, socket) {
  const callerId = socket.user._id;

  const isAllowed = await validateRideAccess(rideId, callerId);

  if (!isAllowed) {
    return null;
  }

   const ride = await rideModel.findById(rideId).select("user captain").lean();

  if (!ride) {
    return null;
  }

  let receiverId;

  if (socket.user.role === "user") {
    receiverId = ride.captain.toString();
  } else {
    receiverId = ride.user.toString();
  }

  return {
    callerId,
    receiverId,
  };
}

module.exports = getCallParticipants;
