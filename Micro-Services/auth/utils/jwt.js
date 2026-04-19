const jwt = require("jsonwebtoken");
const { publicKey ,privateKey} = require("../config/keys");
const { JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_TOKEN_EXPIRY, KEY_ID } = require("../config/config");

const generateAccessToken = ({user, isNewUser = false, sessionId}) =>{
     const payload = {
         sub: user._id, 
         role: user.role 
        };
    if (isNewUser) payload.isNewUser = true;
    if (sessionId) payload.sessionId = sessionId;
    
    return jwt.sign(
        payload,
        privateKey,
        {
            algorithm:"RS256",
            expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
            keyid: KEY_ID,
            issuer: "auth-service",
           audience: ["user-service", "captain-service"],
            jwtid: String(sessionId)
         }
    )
}

const generateRefreshToken = ({user, sessionId}) =>{
    return jwt.sign({
        sub: String(user._id),
        sessionId: String(sessionId),
        

        
    },privateKey,{
        algorithm: "RS256",
        expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
        keyid: KEY_ID,
        issuer: "auth-service",
        audience: "auth-service",
        jwtid: String(sessionId)
        
    }
)
}

    
module.exports = {generateAccessToken, generateRefreshToken};