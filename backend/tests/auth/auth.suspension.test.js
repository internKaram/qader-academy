const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../app');
const User = require('../models/User');
const { SUSPENDED_FIELD, EXPECTED_STATUS } = require('../config/authContract');
 
describe('POST /api/v1/auth/login — suspended user rejection', () => {
  const PLAIN_PASSWORD = 'Password123';
 
  it('rejects login for a suspended user', async () => {
    const passwordHash = await bcrypt.hash(PLAIN_PASSWORD, 10);
 
    await User.create({
      name: 'Suspended Test User',
      email: 'suspended@test.com',
      passwordHash,
      role: 'student',
      [SUSPENDED_FIELD]: true,
    });
 
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'suspended@test.com', password: PLAIN_PASSWORD });
 
    expect(res.status).toBe(EXPECTED_STATUS);
    // A suspended user must never receive a token, regardless of which
    // status code is used — this assertion holds even if EXPECTED_STATUS
    // above turns out to be wrong once confirmed with Faisal.
    expect(res.body.token).toBeUndefined();
  });
 
  it('control case: a NON-suspended user with correct credentials can still log in', async () => {
    // Proves the test above is actually testing suspension specifically,
    // not accidentally failing for an unrelated reason (e.g. a broken
    // login endpoint would make BOTH tests fail identically, and this
    // control case is what tells the two failure modes apart).
    const passwordHash = await bcrypt.hash(PLAIN_PASSWORD, 10);
 
    await User.create({
      name: 'Active Test User',
      email: 'active@test.com',
      passwordHash,
      role: 'student',
      [SUSPENDED_FIELD]: false,
    });
 
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'active@test.com', password: PLAIN_PASSWORD });
 
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
 