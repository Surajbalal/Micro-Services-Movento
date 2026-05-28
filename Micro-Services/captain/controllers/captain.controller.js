const { validationResult } = require("express-validator");
const captainModel = require("../models/captain.model");

const captainService = require('../services/captain.service');
const { error } = require("console");
const blackListTokenModel = require("../models/blackListToken.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

module.exports.registerCaptain = asyncHandler(async(req, res, next)=>{
    console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        throw new AppError("Validation failed", "VALIDATION_ERROR", 400);
    }
    const {fullName, email, password, vehicle} = req.body;

    const isCaptainAlreadyExist = await captainModel.findOne({email});

    if(isCaptainAlreadyExist){
        throw new AppError('Captain already exist', 'CAPTAIN_EXISTS', 400);
    }

    const hashPassword = await captainModel.hashPassword(password);
    const captain = await captainService.createCaptain({
        'firstName': fullName.firstName,
        'lastName': fullName.lastName,
        email,
        'password': hashPassword,
        'color': vehicle.color,
        'plate': vehicle.plate,
        'capacity': vehicle.capacity,
        'vehicleType': vehicle.vehicleType
    })
    const token = captain.genrateToken();
    res.status(201).json({token,captain});
});

module.exports.captainLogin = asyncHandler(async(req, res, next)=>{
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        throw new AppError("Validation failed", "VALIDATION_ERROR", 400);
    }
    const {email, password} = req.body;
  

    const captain = await captainModel.findOne({email}).select('+password');
   
    if(!captain){
        throw new AppError("Invalid email or password", "UNAUTHORIZED", 401);
    }

    const verifyPassword = await captain.comparePassword(password);

    if(!verifyPassword){
        throw new AppError("Invalid email or password", "UNAUTHORIZED", 401);
    }

    const token = captain.genrateToken();


    res.cookie("token", token);

    res.status(200).json({token,captain});
});

module.exports.getProfile = asyncHandler(async(req, res, next)=>{

    res.status(200).json({captain:req.captain});
});

module.exports.logoutCaptain = asyncHandler(async(req,res,next) =>{
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    
      await  blackListTokenModel.create({ token })

      res.status(200).json({message:"logout successfully"});
});

module.exports.updateCaptain = asyncHandler(async(req,res)=>{
     const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", "VALIDATION_ERROR", 400);
  }
  const { updateData } = req.body;
  console.log("update Data",updateData)
  const updatedCaptain = await captainService.updateCaptain(req.captain._id, updateData);
  res.status(200).json({captain:updatedCaptain});
});