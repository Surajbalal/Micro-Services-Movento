const rideModel = require('../models/ride.model');
const { sendMessageToSocketId } = require('../socket');
const mapService = require('./maps.service');
const crypto = require('crypto');
const { publishToQueue } = require('./rabbit');
const AppError = require('../utils/appError');

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
// 
module.exports.generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

module.exports.getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }
 
  const destinationTime = await mapService.getDistanceTime(pickup, destination);
console.log(destinationTime);
    if(destinationTime.distance.value == 0){
      throw new AppError(
      "Pickup and destination must be different locations",
      "SAME_LOCATION",
      400
    );
    }
  const distanceInKm = destinationTime.distance.value / 1000;
  const timeInMin = destinationTime.duration.value / 60;

  const rates = {
    car: { base: 50, perKm: 12, perMin: 2 },
    auto: { base: 30, perKm: 8, perMin: 1.5 },
    motorcycle: { base: 20, perKm: 6, perMin: 1 }
  };

  function calculateFare(rate) {
    return Math.round(
      rate.base +
      distanceInKm * rate.perKm +
      timeInMin * rate.perMin
    );
  }

  return {
    car: calculateFare(rates.car),
    auto: calculateFare(rates.auto),
    motorcycle: calculateFare(rates.motorcycle)
  };
};

module.exports.create = async ({user,pickup,destination,vehicleType,distance,duration})=>{
  console.log("user",user);
  console.log("pickup",pickup);
  console.log("destination",destination);
  console.log("vehicleType",vehicleType);
  console.log("distance",distance);
  console.log("duration",duration);
    if(!user || !pickup || !destination ||!vehicleType || !distance || !duration){
        throw new Error('All fields are required');
    }
    const fare = await this.getFare( pickup.address,
  destination.address);

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        distance,
        duration,
        fare:fare[vehicleType],
        otp: this.generateOtp(),
    })
    console.log("check is this returning full ride detail or not",ride);
    return ride;
}
module.exports.confirmRide = async (rideId,captainId) =>{
  if(!rideId || !captainId){
    throw new Error('RideId and captainId is required');
  }

  const ride = await rideModel.findOneAndUpdate(
    {_id:rideId},
    {status: 'accepted', captain: captainId},
    { new: true })
    // .populate('user')
    // .populate('captain')
    .select('+otp');

  // const ride = rideModel.findOne({_id: rideId}).populate('user');

  if(!ride){
    throw new Error('Ride not found');
  }
  const user = await publishToQueue('get-user',{_id: ride.user});
  const captain = await publishToQueue('get-captain',{_id: ride.captain});
const rideData = ride.toObject();
const result ={
  ...rideData,
  user,
  captain,

}
  return result;
}
module.exports.startRide = async ({ rideId, otp }) => {

  if (!rideId || !otp) {
    throw new Error('rideId and otp are required');
  }

  const ride = await rideModel
    .findOne({ _id: rideId })
    .select('+otp');

  if (!ride) {
    throw new Error('Ride not found');
  }

  if (ride.status !== 'accepted') {
    throw new Error('Ride not accepted');
  }

  if (ride.otp !== otp) {
    throw new Error('Invalid otp');
  }

  // Fetch user & captain from microservice
  const user = await publishToQueue('get-user', { _id: ride.user });
  const captain = await publishToQueue('get-captain', { _id: ride.captain });

  // Update ride status
  ride.status = 'ongoing';
  await ride.save();

  // Convert mongoose document to object
  const rideData = ride.toObject();

  // Attach user and captain
  rideData.user = user;
  rideData.captain = captain;

  // Send updated ride with full data
  sendMessageToSocketId(
    user.socketId,
    'ride-started',
    rideData
  );

  return rideData;
};
module.exports.endRide = async ({rideId, captain}) =>{
  if(!rideId){
    throw new Error('RideId is required');
  }

  const ride = await rideModel.findOne({_id: rideId,captain: captain._id})
  .populate('user')
  .populate('captain')
  .select('+otp')

  if(!ride){
    throw new Error('Ride not found')
  }

  if(ride.status !== 'ongoing'){
    throw new Error('Ride not ongoing')
  }

  await rideModel.findOneAndUpdate({_id: rideId},
    {
      status: 'completed'
    })
  return ride;
}
module.exports.getCaptainInTheRadius = async (lat, lng) => {
  const MAX_RETRIES = 3;

  for (let i = 0; i < MAX_RETRIES; i++) {
    const captains = await mapService.getCaptainInTheRadius(lat, lng, 10);

    if (captains.length > 0) {
      return captains;
    }

   await delay(1000 * Math.pow(2, i));
  }

  throw new AppError(
    "No captains available nearby. Please try again later.",
    "NO_CAPTAIN",
    404
  );
};