const rateLimit = require('express-rate-limit');

/**
 * Custom response handler for Rate Limiter violations in NightZone
 */
const rateLimitHandler = (message) => (req, res, next, options) => {
  res.status(options.statusCode || 429).json({
    success: false,
    message: message || 'Too many requests. Please try again later.',
    retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
  });
};

/**
 * 1. Authentication Rate Limiter (Login, Signup, Google OAuth)
 * Protects against brute-force & credential stuffing attacks
 * Window: 15 minutes, Max: 15 requests per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many authentication attempts from this IP. Please try again after 15 minutes.')
});

/**
 * 2. Password Reset Rate Limiter
 * Protects reset token generation and submission endpoints
 * Window: 1 hour, Max: 5 requests per IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many password reset requests. Please wait an hour before requesting again.')
});

/**
 * 3. General API Rate Limiter
 * Applied globally to /api/* routes to safeguard server resources
 * Window: 15 minutes, Max: 300 requests per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many API requests from this IP. Please slow down and try again later.')
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  apiLimiter
};
