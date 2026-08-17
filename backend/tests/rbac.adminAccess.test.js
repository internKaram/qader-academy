const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const User = require('../models/User');
 

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['sabrin@qader.com', 'salem@qader.com'] } });
});
 
describe('RBAC — /api/v1/admin/* access control', () => {
  const STUDENT_PASSWORD = 'Student@123';
  const ADMIN_PASSWORD = 'Admin@123';
 
  let studentToken;
  let adminToken;
 
  beforeAll(async () => {
    const [studentHash, adminHash] = await Promise.all([
      bcrypt.hash(STUDENT_PASSWORD, 10),
      bcrypt.hash(ADMIN_PASSWORD, 10),
    ]);
 
    await User.create({
      name: 'Sabrin Alqarni',
      email: 'sabrin@qader.com',
      passwordHash: studentHash,
      role: 'student',
    });
 
    await User.create({
      name: 'Salem Shurrab',
      email: 'salem@qader.com',
      passwordHash: adminHash,
      role: 'admin',
    });
 
    const [studentLogin, adminLogin] = await Promise.all([
      request(app).post('/api/v1/auth/login').send({
        email: 'sabrin@qader.com',
        password: STUDENT_PASSWORD,
      }),
      request(app).post('/api/v1/auth/login').send({
        email: 'salem@qader.com',
        password: ADMIN_PASSWORD,
      }),
    ]);
 
    studentToken = studentLogin.body.token;
    adminToken = adminLogin.body.token;
 
    if (!studentToken || !adminToken) {
      throw new Error(
        'Setup failed: login did not return a token for one or both test users — check authController.js before debugging this RBAC test.'
      );
    }
  });
 
  it('blocks a student from GET /api/v1/admin/stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);
 
    expect(res.status).toBe(403);
  });
 
  it('allows an admin to access GET /api/v1/admin/stats', async () => {

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
 
    expect(res.status).toBe(200);
  });
 
  it('blocks an unauthenticated request entirely (no token)', async () => {

    const res = await request(app).get('/api/v1/admin/stats');
 
    expect(res.status).toBe(401);
  });
});