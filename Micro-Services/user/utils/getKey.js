const client = require("../config/jwks");

function getKey(header, callback) {
  if (!header.kid) {
    return callback(new Error("No kid found in token"));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("JWKS fetch error:", err.message);
      return callback(err);
    }
    if (!key) {
      return callback(new Error("Signing key not found"));
    }

    try {
      const signingKey = key.getPublicKey();

      if (!signingKey) {
        return callback(new Error("Public key extraction failed"));
      }

      return callback(null, signingKey);
    } catch (error) {
      console.error("Key processing error:", error.message);
      return callback(error);
    }
  });
}

module.exports = getKey;
