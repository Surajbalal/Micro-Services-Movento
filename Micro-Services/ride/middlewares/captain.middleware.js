// const cookie = require('cookie-parser');
// const captainModel = require('../models/captain.model');
const jwt = require('jsonwebtoken');
const { publishToQueue } = require('../services/rabbit');
const verifyKey = require('../utils/verifyToken');
module.exports.authCaptain = async(req, res, next) =>{
    try {
        console.log(req)
        console.log("first")
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
        console.log(`token : ${token}`);
       

        if(!token){
            console.log("inside token check")
            return res.status(401).json({message:"Unauthorized"});
        }

        
        // Ask AUTH service to check its blacklist DB (tokens are blacklisted there on logout)
        const isBlackList = await publishToQueue("isBlackList-user", { token });
        if(isBlackList){
            console.log(isBlackList, "inside auth captain blacklist check");
            return res.status(401).json({message:"Unauthorized"});
        }
        console.log("dcvsdfvsdfvsdfvsdfvsdfvsdvdsfv")

        const decode = await verifyKey(token);
        if (!decode || decode.role !== 'captain') {
            console.log("inside role check");
            return res.status(401).json({message:"Unauthorized"});
        }
        
        const captain = await publishToQueue("get-captain", { _id: decode.sub });
        console.log(captain,"this is functionality check");
        if(!captain){
          
             return res.status(401).json({message:"Unauthorized"});
        }

        req.captain = captain;

        next();

    } catch (error) {
        return res.status(401).json({message:"Unauthorized"});
    }
}