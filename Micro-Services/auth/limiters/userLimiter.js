const createRateLimiter = require("../middlewares/rateLimiter");

module.exports.loginLimiter = createRateLimiter({
    maxRequest: 5,
    prefix: "user-login",
    type: "ip-email"
})

module.exports.signupLimiter = createRateLimiter({
    maxRequest: 5,
    prefix: "user-signup",
    type: "ip"
})

module.exports.verifyEmailLimiter = createRateLimiter({
    maxRequest: 5,
    prefix: "user-verify-email",
    type: "email"
})

module.exports.forgetPasswordLimiter = createRateLimiter({
    maxRequest: 3,
    prefix: "user-forget-password",
    type: "email"
})

module.exports.resetPasswordLimiter = createRateLimiter({
    maxRequest: 5,
    prefix: "user-reset-password",
    type: "email"
})

module.exports.refreshLimiter = createRateLimiter({
    maxRequest: 30,
    prefix: "user-refresh",
    type: "ip"
})
