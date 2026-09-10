const userModel = require("../models/user.models");
const blackListModel = require("../models/blackListToken.model");
const { validationResult } = require("express-validator");
const { createUser } = require("../services/user.service");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

module.exports.registerUser = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", "VALIDATION_ERROR", 400);
  }
  const { fullName, email, password } = req.body;

  const isUserAlready = await userModel.findOne({email});

  if(isUserAlready){
    throw new AppError("User already exist", "USER_EXISTS", 400);
  }

  const hashPassword = await userModel.hashPassword(password);

  const user = await createUser({
    firstName: fullName.firstName,
    lastName: fullName.lastName,
    email,
    password: hashPassword,
  });
  const token = user.genrateToken();
  return res.status(201).json({ token, user });
});

module.exports.loginUser = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", "VALIDATION_ERROR", 400);
  }
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", "UNAUTHORIZED", 401);
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", "UNAUTHORIZED", 401);
  }
  const token = user.genrateToken();
  res.cookie("token", token);
  return res.status(200).json({ token, user });
});

module.exports.getUserProfile = asyncHandler(async (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  return res.status(200).json(req.user);
});

module.exports.logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  await blackListModel.create({token});
  res.status(200).json({ message: "Logout successfully" });
});
