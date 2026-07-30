const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('../../routes/auth-routes');
const User = require('../../models/user');

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

process.env.JWT_SECRET = 'test_secret_key';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('AUTH-01: POST /api/v1/auth/register', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  it('should successfully create a new user and return 201 with JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('name', validUser.name);
    expect(res.body.user).toHaveProperty('email', validUser.email);
    expect(res.body.user).toHaveProperty('role', 'student');
    
    // Ensure passwordHash is NOT returned
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 400 error if password length < 8 chars', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Password must be at least 8 characters long');
  });

  it('should return 400 error if email is a duplicate', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });
});
