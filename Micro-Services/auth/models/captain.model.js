const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require('../config/config');

const captainSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: [7, 'Password must be at least 7 character']
    },
    role: {
        type: String,
        enum: ["captain"],
        default: "captain",
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    }
});

captainSchema.methods.genrateAcessToken = function(isNewUser = false, sessionId) {
    const payload = { _id: this._id, role: this.role };
    if (isNewUser) {
        payload.isNewUser = true;
    }
    if (sessionId) {
        payload.sessionId = sessionId;
    }
    const acessToken = jwt.sign(payload, config.JWT_ACCESS_TOKEN_SECRET, { expiresIn: config.JWT_ACCESS_TOKEN_EXPIRY });
    return acessToken;
}

captainSchema.methods.genrateRefreshToken = function() {
    const refreshToken = jwt.sign({ _id: this._id, role: this.role }, config.JWT_REFRESH_TOKEN_SECRET, { expiresIn: config.JWT_REFRESH_TOKEN_EXPIRY });
    return refreshToken;
}

captainSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
}
captainSchema.statics.hashPassword = async function(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}

module.exports = mongoose.model("Captain", captainSchema);
