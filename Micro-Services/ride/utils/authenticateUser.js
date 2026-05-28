const { publishToQueue } = require("../services/rabbit");

const verifyToken = require("./verifyToken");

async function authenticateUser(token) {
  if (!token) {
    throw new Error("Unauthorized");
  }

  let isBlackListed = false;

  try {
    isBlackListed = await publishToQueue("isBlackList-user", { token });
  } catch (err) {
    console.error("RabbitMQ error", err);
  }

  if (isBlackListed) {
    throw new Error("Unauthorized");
  }

  const decoded = await verifyToken(token);

  if (!decoded || !decoded.role) {
    throw new Error("Unauthorized");
  }

  let userData;

  if (decoded.role === "user") {
    userData = await publishToQueue("get-user", { _id: decoded.sub });
  } else if (decoded.role === "captain") {
    userData = await publishToQueue("get-captain", { _id: decoded.sub });
  } else {
    throw new Error("Unauthorized");
  }

  if (!userData) {
    throw new Error("Unauthorized");
  }

  userData.role = decoded.role;

  return userData;
}

module.exports = authenticateUser;
