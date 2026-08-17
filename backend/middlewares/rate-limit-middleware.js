const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware for the login endpoint.
 * Limits each IP to 5 requests per 5-minute window to defend against brute-force attacks.
 */
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: { message: 'Too many login attempts from this IP, please try again after 5 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  validate: { trustProxy: false },
});

/**
 * Rate limiting middleware for the password reset endpoint.
 * Limits each IP to 5 requests per 5-minute window to prevent email enumeration and spam.
 */
const resetPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 reset password requests per window
  message: { message: 'Too many password reset attempts from this IP, please try again after 5 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

module.exports = {
  loginLimiter,
  resetPasswordLimiter
};
