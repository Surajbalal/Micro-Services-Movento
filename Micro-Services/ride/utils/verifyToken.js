const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const getKey = require('./getKey');

const verifyAsync = promisify(jwt.verify);

const verifyToken = async (token) => {
  if (!token) {
    console.error("[verifyToken] Token is missing");
    throw new Error("Token missing");
  }
  try {
    console.log("[verifyToken] Attempting JWT verification...");
    const decoded = await verifyAsync(token, getKey, {
      algorithms: ["RS256"],
      issuer: "auth-service",
      audience: ["captain-service", "user-service"],
    });

    console.log("[verifyToken] JWT verified successfully. Sub:", decoded.sub, "Role:", decoded.role, "Aud:", decoded.aud);
    return decoded;

  } catch (error) {
    console.error("[verifyToken] JWT verification error:", error.name, "-", error.message);
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
