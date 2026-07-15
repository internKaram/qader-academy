
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// App setup for testing
const app = express();
app.use(express.json());

// Set secret for test environment
process.env.JWT_SECRET = 'test-secret';

const authMiddleware = require('../../middlewares/auth-middleware');

// Create an isolated inline route to test only the auth middleware
app.get('/api/v1/test-auth', authMiddleware, (req, res) => {
  // If we reach here, auth passed. We can send back the decoded user to verify it attached correctly.
  res.status(200).json({ message: 'Authenticated!', user: req.user });
});

describe('Auth Middleware (AUTH-04)', () => {
  let validToken;
  let expiredToken;

  beforeAll(() => {
    // Generate a valid token
    validToken = jwt.sign(
      { userId: '123', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate an expired token
    expiredToken = jwt.sign(
      { userId: '123', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' } // Immediately expired
    );
  });

  // Added mandatory Mongoose cleanup to prevent Jest from hanging
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  // Test Case 1: No token
  it('should block a request without a token with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/test-auth');
    
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Not authorized, no token provided');
  });

  // Test Case 2: Invalid or expired token
  it('should block a request with an invalid/expired token with 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/v1/test-auth')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Not authorized, token failed or expired');
  });

  // Test Case 3: Valid token
  it('should permit a request with a valid token and attach user to req', async () => {
    const res = await request(app)
      .get('/api/v1/test-auth')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Authenticated!');
    expect(res.body.user).toHaveProperty('userId', '123');
    expect(res.body.user).toHaveProperty('role', 'student');
  });
});
