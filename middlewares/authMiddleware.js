const { verifyAccessToken } = require('../utils/tokenUtils');
const { User } = require('../models');
const ApiResponse = require('../utils/apiResponse');

/**
 * Authentication Middleware for NightZone
 * Protects private routes by validating JWT access tokens in the Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token = null;

    // Check for Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.error(res, 'Authentication token required. Please login.', 401);
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return ApiResponse.error(res, 'Invalid or expired access token. Please refresh or login again.', 401);
    }

    // Find active user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return ApiResponse.error(res, 'User account associated with this token no longer exists.', 401);
    }

    if (!user.is_active) {
      return ApiResponse.error(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    if (user.isLocked()) {
      return ApiResponse.error(res, 'Account is temporarily locked due to security reasons. Try again later.', 403);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Optional Authentication Middleware
 * Populates req.user if a valid token is present, otherwise continues without error
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await User.findByPk(decoded.id);
        if (user && user.is_active && !user.isLocked()) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  optionalAuth
};

