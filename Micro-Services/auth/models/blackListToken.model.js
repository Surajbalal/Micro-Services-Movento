const mongoose = require("mongoose");

const blackListTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  role: {
    type: String,
    enum: ["user", "captain"],
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// MongoDB TTL index: auto-delete documents after expiresAt
// This keeps the collection small — entries are removed when the access token
// would have expired anyway (i.e., the blacklist entry is no longer needed)
blackListTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("UserBlackListToken", blackListTokenSchema);
