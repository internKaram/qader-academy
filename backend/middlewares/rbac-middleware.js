
/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Checks if the authenticated user (via req.user) has one of the required roles.
 * Must be chained AFTER authMiddleware.
 * 
 * @param {...string} roles - A comma-separated list of allowed roles (e.g., 'admin', 'teacher').
 * @returns {Function} Express middleware function that evaluates the user's role.
 *                     Calls next() if the user is authorized, or returns 403 Forbidden JSON if denied.
 */
const rbacMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  };
};

module.exports = rbacMiddleware;
