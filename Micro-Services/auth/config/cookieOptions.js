/**
 * Shared cookie configuration for refresh tokens.
 *
 * LOCAL DEV:  secure: false  — HTTP (no HTTPS needed on localhost)
 *             sameSite: "lax" — allows cookie on same-site cross-port requests
 *
 * PRODUCTION: flip to secure: true, sameSite: "strict" before deploying.
 */
const IS_PROD = process.env.NODE_ENV === "production";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? "strict" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

module.exports = { REFRESH_TOKEN_COOKIE_OPTIONS };
