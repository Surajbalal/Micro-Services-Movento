const { cookie } = require("express-validator");
const userModel = require("../models/user.models");
const blackListModel = require('../models/blackListToken.model')
const jwt = require('jsonwebtoken');
const getKey = require("../utils/getKey");
const verifyToken = require("../utils/verifyToken");

module.exports.authUser = async (req,res,next)=>{
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    console.log("Token: ",token);
    if(!token){
        return res.status(401).json({message:"Unauthorized access"})
    }
    const isBlackListed = await blackListModel.findOne({token})
    if(isBlackListed){
        return res.status(401).json({message:"Unauthorised"});
    }
    try {
        // const decode =  jwt.verify(token,process.env.JWT_SECRET);
        console.log("start")
        const decoded = await verifyToken(token);
        console.log("end")
        if(!decoded){
             return res.status(401).json({message:"Unauthorized access"});
        }
        
        if (decoded.role !== 'user') {
            return res.status(401).json({message:"Unauthorized access"});
        }
        const user = await userModel.findById(decoded.sub).lean();
           if (!user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
        
        req.user = user

        return next()
    
    } catch (error) {
        console.error(error); 
         return res.status(401).json({message:"Unauthorized access"})
    
    }
}