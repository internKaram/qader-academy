const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

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
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const logout = async (req, res) => {
  // With stateless JWTs, true invalidation happens when the frontend clears localStorage.
  // This endpoint provides a clean backend response confirming the action.
  return res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  logout
};
