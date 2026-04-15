const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const BlacklistToken = require("../models/blackListToken.model");
const { publicKey } = require("../config/keys");

module.exports.authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isBlacklisted = await BlacklistToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const decoded = jwt.verify(token, publicKey,{
      algorithms:["RS256"],
      issuer:"auth-service",
      audience:"user-service",
      
    });

    let userData;

    if (decoded.role === "user") {
      userData = await userModel.findById(decoded.sub).lean();
    } else if (decoded.role === "captain") {
      userData = await captainModel.findById(decoded.sub).lean();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!userData) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = userData;

    req.user.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
