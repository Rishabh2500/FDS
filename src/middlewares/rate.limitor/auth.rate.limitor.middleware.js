const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute
  max: 5,   // max 5 attempts
  message: {
    status: 429,
    message: "Too many attempts. Try again later."
  }
});

module.exports = authLimiter;