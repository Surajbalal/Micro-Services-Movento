const crypto = require("crypto");
const { publicKey } = require("../config/keys");
const { KEY_ID } = require("../config/config");

module.exports.getJWJKS = (req, res) => {
  try {
    const keyObject = crypto.createPublicKey(publicKey);

    const jwk = keyObject.export({ format: "jwk" });

    res.json({
      keys: [
        {
          ...jwk,
          kid: KEY_ID,
          use: "sig",
          alg: "RS256",
        },
      ],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};