const rideModel = require("../../models/ride.model");

async function validateRideAccess(rideId, userId) {
   console.log("start------------343434343434343434343434")
  const ride = await rideModel.findById(rideId).select("user captain").lean();
console.log("end----------------")
  if (!ride) {
    return false;
  }
console.log("rideId",ride)
console.log("userrrrr userId",userId)
  const isAllowed =
    ride.user?.toString() === userId.toString() ||
    ride.captain?.toString() === userId.toString();
console.log('isAllowed',isAllowed)
  return isAllowed;
}

module.exports = validateRideAccess;
