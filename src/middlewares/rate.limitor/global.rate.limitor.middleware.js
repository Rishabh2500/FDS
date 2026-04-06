const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // max 100 attempts
  standardHeaders: true,
  legacyHeaders: false, 

  message: {
    status: 429,
    message: "Too many requests, please try again later."
  },

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Try again after some time."
    });
  }
});

module.exports = globalLimiter;