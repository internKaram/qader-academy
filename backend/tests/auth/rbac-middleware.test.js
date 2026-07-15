
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
const rbacMiddleware = require('../../middlewares/rbac-middleware');

// Create an isolated inline route for testing
app.get('/api/v1/admin/dashboard', authMiddleware, rbacMiddleware('admin'), (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard!' });
});

describe('RBAC Middleware (AUTH-04)', () => {
  let studentToken;
  let adminToken;

  beforeAll(() => {
    // Generate a valid token for a student
    studentToken = jwt.sign(
      { userId: '123', role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate a valid token for an admin
    adminToken = jwt.sign(
      { userId: '456', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  // Added mandatory Mongoose cleanup to prevent Jest from hanging
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });



  // Test Case 1: Student token
  it('should block a student from accessing admin dashboard with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Access denied. Admins only.');
  });

  // Test Case 2: Admin token
  it('should permit an admin to access the dashboard with 200 OK', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Welcome to the admin dashboard!');
  });
});
