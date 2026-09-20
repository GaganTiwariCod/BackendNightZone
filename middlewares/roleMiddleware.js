const ApiResponse = require('../utils/apiResponse');

/**
 * Role-Based Access Control (RBAC) Guard Middleware for NightZone
 * @param  {...string} allowedRoles - List of permitted roles (e.g. 'ADMIN', 'MERCHANT')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required before checking permissions.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required roles: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
