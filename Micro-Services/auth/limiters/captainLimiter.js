const createRateLimiter = require("../middlewares/rateLimiter");

module.exports.loginLimiter = createRateLimiter({
    maxRequest: 5,
    prefix: "captain-login",
    type: "ip-email"
})

module.exports.signupLimiter = createRateLimiter({
    maxRequest: 5,
    prefix: "captain-signup",
    type: "ip"
})

module.exports.verifyEmailLimiter = createRateLimiter({
    maxRequest: 5,
    prefix: "captain-verify-email",
    type: "email"
})

module.exports.forgetPasswordLimiter = createRateLimiter({
    maxRequest: 3,
    prefix: "captain-forget-password",
    type: "email"
})

module.exports.resetPasswordLimiter = createRateLimiter({
    maxRequest: 5,
    prefix: "captain-reset-password",
    type: "email"
})

module.exports.refreshLimiter = createRateLimiter({
    maxRequest: 30,
    prefix: "captain-refresh",
    type: "ip"
})
