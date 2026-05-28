const captainModel = require('../models/captain.model');
const AppError = require("../utils/appError");

module.exports.createCaptain = async ({
    firstName, lastName, email ,password, color, plate, capacity, vehicleType
})=>{
    
    if( !firstName || !lastName || !email || !password || !color || !plate || !capacity || !vehicleType){
        throw new AppError('All fields are required', "BAD_REQUEST", 400);
    }
    const captain = captainModel.create({
        fullName:{
            firstName,
            lastName,
         },
         email,
         password,
         vehicle:{
            color,
            plate,
            capacity,
            vehicleType
         }
    })
    return captain
}
module.exports.updateCaptain = async(captainId, updateData) => {
    if (!updateData || Object.keys(updateData).length === 0) {
  throw new Error("No valid data to update");
}
    const updatedCaptain = await captainModel.findByIdAndUpdate(captainId, 
        {$set: updateData },
        { new: true, runValidators: true });
    if(!updatedCaptain){
        throw new AppError("Captain not found", "NOT_FOUND", 404);
    }
    return updatedCaptain;
}