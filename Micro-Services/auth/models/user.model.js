const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require('../config/config');
 const userSchema = new mongoose.Schema({
    email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ["user", "captain"],
    required: true
  },
  verified: {
    type: Boolean,
    default: false
    
  }
 })
 userSchema.index({ email: 1 });

 userSchema.methods.genrateAcessToken = function(isNewUser = false,sessionId){
    const payload = { _id: this._id, role: this.role };
    if (isNewUser) {
        payload.isNewUser = true;
    }
    if(sessionId){
      payload.sessionId = sessionId;
    }
    const acessToken = jwt.sign(payload, config.JWT_ACCESS_TOKEN_SECRET, {expiresIn: config.JWT_ACCESS_TOKEN_EXPIRY});
    return acessToken;
 }

 userSchema.methods.genrateRefreshToken = function(){
    const refreshToken = jwt.sign({_id: this._id, role: this.role},config.JWT_REFRESH_TOKEN_SECRET,{expiresIn: config.JWT_REFRESH_TOKEN_EXPIRY})
    return refreshToken;
 }

 userSchema.methods.comparePassword = async function(password){
     console.log("this is inside compare password method",password);
  console.log("this is inside compare password method",this.password);
    return bcrypt.compare(password,this.password);
 }
 userSchema.statics.hashPassword = async function(password){
  if (!password) throw new Error("Password is required");

    const hashedPassword = await bcrypt.hash(password,10);
    return hashedPassword;
 }

module.exports = mongoose.model("users", userSchema);