const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('AUTH-03: POST /api/v1/auth/logout', () => {
  it('should return 200 OK with logout success message', async () => {
    const res = await request(app).post('/api/v1/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');
  });
});
