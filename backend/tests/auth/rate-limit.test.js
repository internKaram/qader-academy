const request = require('supertest');
const express = require('express');
const { loginLimiter, resetPasswordLimiter } = require('../../middlewares/rate-limit-middleware');

describe('AUTH-SEC: Authentication Rate Limiting Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.set('trust proxy', true);
    app.use(express.json());

    app.post('/test-login', loginLimiter, (req, res) => {
      res.status(200).json({ success: true });
    });

    app.post('/test-reset', resetPasswordLimiter, (req, res) => {
      res.status(200).json({ success: true });
    });
  });

  describe('Login Rate Limiter (loginLimiter)', () => {
    it('should allow up to 5 login attempts within the window and block the 6th with 429', async () => {
      const testIp = '192.168.1.50';

      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/test-login')
          .set('X-Forwarded-For', testIp)
          .send({});
        expect(res.status).toBe(200);
      }

      const blockedRes = await request(app)
        .post('/test-login')
        .set('X-Forwarded-For', testIp)
        .send({});

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.message).toMatch(/Too many login attempts/);
    });
  });

  describe('Password Reset Rate Limiter (resetPasswordLimiter)', () => {
    it('should allow up to 5 reset attempts within the window and block the 6th with 429', async () => {
      const testIp = '192.168.1.51';

      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/test-reset')
          .set('X-Forwarded-For', testIp)
          .send({});
        expect(res.status).toBe(200);
      }

      const blockedRes = await request(app)
        .post('/test-reset')
        .set('X-Forwarded-For', testIp)
        .send({});

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.message).toMatch(/Too many password reset attempts/);
    });
  });
});
