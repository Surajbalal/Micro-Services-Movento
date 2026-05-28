// const cookie = require('cookie-parser');
const captainModel = require('../models/captain.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');
const verifyKey = require('../utils/verifyToken');
const { publishToQueue } = require('../services/rabbitmq/publish');
module.exports.authCaptain = async(req, res, next) =>{
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if(!token){
            return res.status(401).json({message:"Unauthorized1"});
        }

        
        // const isBlackList = await blackListTokenModel.findOne({token});
        
        // if(isBlackList){
        //     return res.status(401).json({message:"Unauthorized"});
        // }
 // Ask AUTH service to check its blacklist DB (that's where tokens are blacklisted on logout)
    const isBlackListed = await publishToQueue('isBlackList-user', { token });
    console.log(isBlackListed, "blacklist check");
    
    if(isBlackListed){
        console.log("inside blacklist check");
        return res.status(401).json({message:"Unauthorised2"});
    }
       const decoded =  await verifyKey(token);
         if(!decoded){
             return res.status(401).json({message:"Unauthorized access"});
        }
        if (decoded.role !== 'captain') {
            return res.status(401).json({message:"Unauthorized3"});
        }
        
        const captain = await captainModel.findById(decoded.sub);

        if(!captain){
            if (decoded.isNewUser === true) {
                // Return 202 Accepted as the profile is pending sync via RabbitMQ
                res.setHeader('Retry-After', '1');
                return res.status(202).json({
                    status: "pending",
                    message: "Profile is being created. Please retry shortly."
                });
            } else {
                // If isNewUser is false or missing, user isn't pending sync
                return res.status(404).json({ message: "User not found" });
            }
        }

        req.captain = captain;

       return next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({message:"Unauthorized4"});
    }
}