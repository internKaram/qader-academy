
/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * Checks if the authenticated user (via req.user) has one of the required roles.
 * Must be chained AFTER authMiddleware.
 *
 * @param {...string} roles - One or more allowed role strings (e.g., 'admin', 'instructor').
 * @returns {Function} Express middleware function that evaluates the user's role.
 *                     Calls next() if the user is authorized, or returns a 403 Forbidden
 *                     JSON response that lists the required role(s) if access is denied.
 */
const rbacMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = rbacMiddleware;
