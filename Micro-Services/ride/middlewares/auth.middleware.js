const authenticateUser =
  require("../utils/authenticateUser");

module.exports.auth =
  async (req, res, next) => {

    try {

      const token =
        req.headers.authorization
          ?.split(" ")[1]
        || req.cookies?.token;

      const user =
        await authenticateUser(token);

      req.user = user;
      

      if (user.role === "captain") {
        req.captain = user;
      }

      next();

    } catch (err) {

      console.error(
        "Auth middleware error",
        err
      );

      return res.status(401).json({
        message: "Unauthorized"
      });

    }

};