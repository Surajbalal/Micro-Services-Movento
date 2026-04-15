// const cookie = require('cookie-parser');
const captainModel = require('../models/captain.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');
module.exports.authCaptain = async(req, res, next) =>{
    try {
        console.log(req)
        console.log("first")
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        console.log(`token : ${token}`);
       

        if(!token){
            console.log("inside token check")
            return res.status(401).json({message:"Unauthorized"});
        }

        
        const isBlackList = await blackListTokenModel.findOne({token});
        
        if(isBlackList){

            return res.status(401).json({message:"Unauthorized"});
        }

        const decode  =  jwt.verify(token,process.env.JWT_SECRET);
        if (decode.role !== 'captain') {
            return res.status(401).json({message:"Unauthorized"});
        }
        
        const captain = await captainModel.findById(decode._id);

        if(!captain){
          
             return res.status(401).json({message:"Unauthorized"});
        }

        req.captain = captain;

        next();

    } catch (error) {
        return res.status(401).json({message:"Unauthorized"});
    }
}
// const { cookie } = require("express-validator");
// const userModel = require("../models/user.models");
// const blackListModel = require("../models/blackListToken.model");
// const jwt = require("jsonwebtoken");
// const getKey = require("../utils/getKey");
// const verifyToken = require("../utils/verifyToken");

// module.exports.authUser = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
//   console.log("Token: ", token);
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized access" });
//   }
//   const isBlackListed = await blackListModel.findOne({ token });
//   if (isBlackListed) {
//     return res.status(401).json({ message: "Unauthorised" });
//   }
//   try {
//     // const decode =  jwt.verify(token,process.env.JWT_SECRET);
//     console.log("start");
//     const decoded = await verifyToken(token);
//     console.log("end");
//     if (!decoded) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }

//     let userData;

//     if (decoded.role == "user") {
//       userData = await userModel.findById(decoded.sub).lean();
//     } else if (decoded.role == "captain") {
//       userData = await publishToQueue("get-captain", { _id: decoded.sub });
//     } else {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }

//     if (!userData) {
//       return res.status(401).json({ message: "Unauthorized access" });
//     }

//     req.user = user;

//     return next();
//   } catch (error) {
//     console.error(error);
//     return res.status(401).json({ message: "Unauthorized access" });
//   }
// };
