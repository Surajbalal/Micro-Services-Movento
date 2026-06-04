const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const getKey = require('./getKey');

const verifyAsync = promisify(jwt.verify);

const verifyToken = async (token) => {
  if (!token) {
    throw new Error("Token missing");
  }
  try {
    const decoded = await verifyAsync(token, getKey, {
      algorithms: ["RS256"],
      issuer: "auth-service",
      audience: "captain-service",
    });

    return decoded;

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
   if (error.name === "JsonWebTokenError") {
    console.log("JWT ERROR:", error);
    throw error;
}
    throw new Error("Authentication failed");
  }
};

module.exports = verifyToken;
