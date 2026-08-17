const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.mock('../../services/certificatePdfService', () => ({
  generateCertificatePdf: jest.fn().mockResolvedValue('/mock/path.pdf'),
}));

const User = require('../../models/user');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const adminRoutes = require('../../routes/admin-routes');
const enrollmentRoutes = require('../../routes/enrollmentRoutes');
const certificateRoutes = require('../../routes/certificateRoutes');

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/certificates', certificateRoutes);

process.env.JWT_SECRET = 'owasp_test_secret_key_123';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Course.deleteMany({});
  await Enrollment.deleteMany({});
});

describe('SEC: Access Control & Data Leakage Prevention (OWASP A01, A02, A03)', () => {
  let studentUser;
  let adminUser;
  let studentToken;
  let adminToken;
  let testCourse;

  beforeEach(async () => {
    studentUser = await User.create({
      name: 'Alice Student',
      email: 'alice@example.com',
      passwordHash: '$2a$10$hashedPasswordHereAlice',
      role: 'student',
    });

    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin@example.com',
      passwordHash: '$2a$10$hashedPasswordHereAdmin',
      role: 'admin',
    });

    testCourse = await Course.create({
      title: 'Security 101',
      description: 'Intro to Web Security',
      category: 'Cybersecurity',
      price: 0,
      instructorId: adminUser._id,
      isPublished: true,
    });

    studentToken = jwt.sign(
      { userId: studentUser._id.toString(), role: 'student' },
      process.env.JWT_SECRET
    );

    adminToken = jwt.sign(
      { userId: adminUser._id.toString(), role: 'admin' },
      process.env.JWT_SECRET
    );
  });

  describe('A01: Broken Access Control', () => {
    it('should reject unauthenticated requests to GET /api/v1/certificates with 401', async () => {
      const res = await request(app).get('/api/v1/certificates');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Not authorized/);
    });

    it('should prevent student from enrolling on behalf of another student via IDOR', async () => {
      const victimStudent = await User.create({
        name: 'Victim Student',
        email: 'victim@example.com',
        passwordHash: '$2a$10$hashedPasswordHereVictim',
        role: 'student',
      });

      // Alice tries to enroll the victim student by passing victim's ID in body
      const res = await request(app)
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studentId: victimStudent._id.toString(),
          courseId: testCourse._id.toString(),
        });

      expect(res.status).toBe(201);
      // Enrollment must be created for Alice (authenticated student), NOT the victim
      const enrollment = await Enrollment.findById(res.body.enrollment._id);
      expect(enrollment.studentId.toString()).toBe(studentUser._id.toString());
      expect(enrollment.studentId.toString()).not.toBe(victimStudent._id.toString());
    });
  });

  describe('A02: Sensitive Data Exposure / Cryptographic Failures', () => {
    it('should NOT leak passwordHash in GET /api/v1/admin/users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users.length).toBeGreaterThan(0);

      for (const user of res.body.users) {
        expect(user).not.toHaveProperty('passwordHash');
        expect(user).not.toHaveProperty('password');
      }
    });
  });

  describe('A03: Injection & ReDoS Protection', () => {
    it('should safely handle regex special characters in admin user search without crashing', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?search=.*+?^${}()|[]\\')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
    });
  });
});
