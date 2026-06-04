const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const getKey = require('./getKey');

const verifyAsync = promisify(jwt.verify);

const verifyKey = async(token)=>{
     if (!token) {
    throw new Error("Token missing");
  }
    try {
        const decoded = await verifyAsync(token,getKey,{
             algorithms: ["RS256"],
    issuer: "auth-service",
    audience: "captain-service",
        });

        return decoded
        
    } catch (error) {
    console.log("VERIFY ERROR NAME:", error.name);
    console.log("VERIFY ERROR:", error);

 if (error.name === "JsonWebTokenError") {
    console.log("JWT ERROR:", error);
    throw error;
}
    if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
    }

    throw error;
}
        
    
}
module.exports = verifyKey;