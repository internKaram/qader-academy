const request = require('supertest');
const express = require('express');
const helmet = require('helmet');

describe('SEC: Helmet Security Headers Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(helmet());
    app.use(express.json());

    app.get('/api/v1/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
  });

  it('should attach standard security headers to responses', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
    expect(res.headers).toHaveProperty('x-dns-prefetch-control', 'off');
    expect(res.headers).toHaveProperty('referrer-policy', 'no-referrer');
  });

  it('should remove the X-Powered-By header to prevent server fingerprinting', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.headers).not.toHaveProperty('x-powered-by');
  });
});
