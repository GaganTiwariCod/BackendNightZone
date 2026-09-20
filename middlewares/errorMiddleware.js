const ApiResponse = require('../utils/apiResponse');

/**
 * 404 Route Not Found Catcher
 */
const notFoundHandler = (req, res, next) => {
  return ApiResponse.error(res, `Resource not found: [${req.method}] ${req.originalUrl}`, 404);
};

/**
 * Global Centralized Error Handler for NightZone
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Sequelize Unique Constraint Violation (e.g. duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate field value entered.';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: `${e.path} must be unique`
    }));
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = 'Database validation failed.';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // JWT Specific Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token signature.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please refresh or re-authenticate.';
  }

  // Hide internal database stack traces in production
  if (process.env.NODE_ENV !== 'development') {
    if (statusCode === 500) {
      message = 'An unexpected server error occurred. Please try again later.';
    }
  } else {
    console.error(' [NightZone Error Handler]:', err);
  }

  return ApiResponse.error(res, message, statusCode, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
