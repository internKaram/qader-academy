const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * 
 * Extracts the JWT from the Authorization header, verifies it using the JWT_SECRET,
 * and attaches the decoded payload to the `req.user` object.
 * 
 * @param {Object} req - Express request object. Expects `req.headers.authorization` to contain 'Bearer <token>'.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void} Calls next() if authenticated, or returns 401 Unauthorized JSON response if failed.
 * @throws {Error} Throws a fatal error if JWT_SECRET is not defined in the environment variables.
 */
const authMiddleware = (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
    }

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    if (error.message.startsWith('FATAL ERROR')) {
      throw error; 
    }
    return res.status(401).json({ message: 'Not authorized, token failed or expired' });
  }
};

module.exports = authMiddleware;
