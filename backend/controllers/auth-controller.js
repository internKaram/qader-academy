const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Registers a new user with the given credentials.
 *
 * @async
 * @param {Object} req - Express request object containing name, email, and password in the body.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} Returns a 201 status with the JWT and user profile if successful, or error payload.
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password with cost factor of 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create and save new user
    const newUser = new User({
      name,
      email,
      passwordHash
    });

    const savedUser = await newUser.save();

    // Generate JWT (7-day expiry, contains userId and role)
    const payload = {
      userId: savedUser._id,
      role: savedUser.role
    };

    if (!process.env.JWT_SECRET) {
      throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return 201 Created with token and user profile (excluding passwordHash)
    return res.status(201).json({
      token,
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        avatar: savedUser.avatar,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Authenticates a user and returns a JSON Web Token.
 *
 * @async
 * @param {Object} req - Express request object containing email and password in the body.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} Returns a 200 status with the JWT and user profile if successful, or error payload.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      userId: user._id,
      role: user.role
    };

    if (!process.env.JWT_SECRET) {
      throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Logs out a user.
 * Note: With stateless JWTs, actual invalidation happens on the client side by clearing storage.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} Returns a 200 status confirming logout.
 */
const logout = async (req, res) => {
  // With stateless JWTs, true invalidation happens when the frontend clears localStorage.
  // This endpoint provides a clean backend response confirming the action.
  return res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * Initiates the password reset process.
 * Generates a 15-minute reset token and mocks an email delivery. Protects against enumeration.
 *
 * @async
 * @param {Object} req - Express request object containing email in the body.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} Returns a 200 status confirming the action, or error payload.
 */
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
    }

    // Generate a reset token
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Mock sending email
    const resetLink = `http://localhost:5000/reset-password?token=${resetToken}`;
    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Password Reset Request`);
    console.log(`Body: Click the following link to reset your password: ${resetLink}`);
    console.log('------------------');

    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  resetPassword
};
