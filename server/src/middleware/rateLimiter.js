const rateLimit = require("express-rate-limit");

/**
 * Strict limiter for auth endpoints (login, register, password reset).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

/**
 * General API limiter.
 */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});

/**
 * Tight limiter for file upload endpoints.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Upload limit reached. Please wait before uploading again.",
  },
});

module.exports = { authLimiter, globalLimiter, uploadLimiter };
