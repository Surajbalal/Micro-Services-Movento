const { cookie } = require("express-validator");

const jwt = require('jsonwebtoken');
const { publishToQueue } = require("../services/rabbitmq/publish");

module.exports.authUser = async (req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    console.log("Token: ",token);
if (!token) {
    console.log("inside token check");
    return res.status(401).json({
        message: "Token missing"
    });
}
    // const isBlackListed = await blackListModel.findOne({token})
    console.log("inside auth user")
    const isBlackListed = await publishToQueue('isBlackList-user',{token})
console.log(
  "Blacklist Result:",
  isBlackListed,
  typeof isBlackListed
);
if (isBlackListed) {
    return res.status(401).json({
        message: "Token blacklisted"
    });
}
    try {
        console.log("TOKEN:", token);

const decodedRaw = jwt.decode(token);
console.log("DECODED RAW:", decodedRaw);
        const decode =  jwt.verify(token,process.env.JWT_SECRET);
        if (decode.role !== 'user') {
            console.log("inside user check")
            return res.status(401).json({ message: error.message});
        }
        // const user =await userModel.findById(decode._id);
        const user =await publishToQueue('get-user',{_id: decode._id});
        
        if (!user) {
            console.log("user not found - pending sync");
            if (decode.isNewUser === true) {
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

        req.user = user
console.log(user,"user")

        return next()
    
    } catch (error) {
       console.error("AUTH ERROR:", error);

    return res.status(401).json({
        message: error.message,
        stack: error.stack
    });
    
    }
}