const { validationResult, ExpressValidator } = require("express-validator");
const rideService = require("../services/ride.service");
const mapService = require("../services/maps.service");
const rideModel = require('../models/ride.model')
const { sendMessageToSocketId } = require("../socket");
const { publishToQueue } = require("../services/rabbit");
const asyncHandler = require("../utils/asyncHandler");

module.exports.createRide = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", "VALIDATION_ERROR", 400);
  }
    const { pickup, destination, vehicleType } = req.body;

    const pickupCoordinates = await mapService.getAddressCoordinates(pickup);
    const destinationCoordinates = await mapService.getAddressCoordinates(destination);
    const distanceTime = await mapService.getDistanceTime(pickup,destination)
    // const findCaptainInRadius = await mapService.getCaptainInTheRadius(pickupCoordinates.lat,pickupCoordinates.lng,10); 
    const findCaptainInRadius = await rideService.getCaptainInTheRadius(pickupCoordinates.lat,pickupCoordinates.lng)

//     if(distanceTime.distance.value == 0){
//       return res.status(400).json({
//   message: "Pickup and destination cannot be the same. Please choose different locations."
// });
    // }
   
// console.log("distanceTime",distanceTime);
    const ride = await rideService.create({
      user: req.user._id,
     pickup: {
  address: pickup,
  location: {
    type: "Point",
    coordinates: [
      pickupCoordinates.lng,
      pickupCoordinates.lat
    ]
  }
},
destination: {
  address: destination,
  location: {
    type: "Point",
    coordinates: [
      destinationCoordinates.lng,
      destinationCoordinates.lat
    ]
  }
},
      vehicleType,
      distance:distanceTime.distance.value,
      duration:distanceTime.duration.value,

    }); 

    // ride.otp = "";
    // const userDetails = await rideModel.findOne({_id: ride._id}).populate('user');

    const userDetails = await publishToQueue("get-user",{_id: req.user._id});
    // console.log("this is functionality check",findCaptainInRadius,ride);
    findCaptainInRadius.map((captain)=>{
      sendMessageToSocketId(captain.socketId,
         "new-ride",
         {
          ride,
          user: userDetails,
         }
        
      )
    })

   
    return res.status(201).json(ride);
});
module.exports.getfare = asyncHandler(async (req, res) => {
  const  errors  = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", "VALIDATION_ERROR", 400);
  }

  const { pickup, destination } = req.query;
console.log("inside controller",pickup,destination)

 
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  
});
module.exports.confirmRide = async (req,res) =>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }
  
  const {rideId, captainId} = req.body;
  
  
  try {
    console.log("satrt")
    const ride = await rideService.confirmRide(rideId,captainId);
    // console.log("this is ride details",ride); 
    console.log("this is ride details",ride.user.socketId); 
    sendMessageToSocketId(ride.user.socketId,
      'ride-confirm', 
       ride
    )
    
  return res.status(200).json(ride);
  } catch (error) {
   return res.status(500).json({message: "Internal server error"});
  }

}
module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rideId, otp } = req.query;

    const ride = await rideService.startRide({ rideId, otp });

    return res.status(200).json({
      message: "Ride started ",
      ride
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
module.exports.endRide = async (req, res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
try {
  const {rideId} = req.body;
  const ride = await rideService.endRide({rideId, captain:req.captain});

  sendMessageToSocketId(ride.user.socketId,
    'ride-ended',
    ride
  )

 return res.status(200).json({
      message: "Ride completed ",
      ride
    });
} catch (error) {
   return res.status(500).json({
      message: error.message
    });
}
}