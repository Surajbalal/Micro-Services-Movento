const { cookie } = require("express-validator");

const jwt = require('jsonwebtoken');
const { publishToQueue } = require("../services/rabbit");
const verifyToken = require("../utils/verifyToken");

module.exports.authUser = async (req,res,next)=>{
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    console.log("Token: ",token);
    if(!token){
        return res.status(401).json({message:"Unauthorized access"})
    }
    // const isBlackListed = await blackListModel.findOne({token})
    let isBlackListed = false;
    try {
        console.log("inside auth user")
        isBlackListed = await publishToQueue('isBlackList-user',{token})
        console.log(isBlackListed,"sdfsdf")
    } catch (err) {
        console.error("RabbitMQ error", err);
    }
    
    if(isBlackListed){
        return res.status(401).json({message:"Unauthorised"});
    }
    try {
        const decode =  await verifyToken(token);
        console.log("decode check",decode);
        if (decode.role !== 'user') {
            return res.status(401).json({message:"Unauthorized access"});
        }

        // const user =await userModel.findById(decode._id);
        let user;
        try {
            user = await publishToQueue('get-user',{_id: decode.sub});
        } catch (err) {
            console.error("RabbitMQ get-user error", err);
            return res.status(500).json({message: "Failed to fetch user context"});
        }

        if(!user){
             return res.status(401).json({message:"Unauthorized access"})
        }
        console.log("user test",user);
        
        req.user = user

        return next()
    
    } catch (error) {
         return res.status(401).json({message:"Unauthorized access"})
    
    }
}