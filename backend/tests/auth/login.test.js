// TODO: Incomplete because of frontend. This should be an E2E test.
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('../../routes/authRoutes');
const User = require('../../models/User');

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

describe('AUTH-02: POST /api/v1/auth/login', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
  });

  it('should successfully login and return 200 with valid JWT and profile', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: validUser.email,
        password: validUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token.split('.').length).toBe(3); 
    
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', validUser.email);
    
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 401 Unauthorized for incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: validUser.email,
        password: 'WrongPassword123'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 401 Unauthorized for non-existent user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'notfound@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});
