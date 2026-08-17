const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../app');
const User = require('../models/User');
const Progress = require('../models/Progress');
 

const Course =
  mongoose.models.Course || mongoose.model('Course', new mongoose.Schema({ title: String }));
const Lesson =
  mongoose.models.Lesson ||
  mongoose.model(
    'Lesson',
    new mongoose.Schema({
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      title: String,
    })
  );
 
describe('POST /api/v1/progress — express-validator', () => {
  let token;
  let courseId;
  let lessonId;
 
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('Student@123', 10);
    await User.create({
      name: 'Validation Test Student',
      email: 'validation-student@qader.com',
      passwordHash,
      role: 'student',
    });
 
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'validation-student@qader.com', password: 'Student@123' });
    token = login.body.token;
 
    if (!token) {
      throw new Error('Setup failed: login did not return a token — check authController.js.');
    }
 
    const course = await Course.create({ title: 'Validation Test Course' });
    const lesson = await Lesson.create({ course: course._id, title: 'Only Lesson' });
    courseId = course._id.toString();
    lessonId = lesson._id.toString();
  });
 
  it('returns 400 with a field-level error array for a malformed courseId', async () => {
    const res = await request(app)
      .post('/api/v1/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: 'not-an-id', lessonId });
 
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.some((e) => e.field === 'courseId')).toBe(true);
  });
 
  it('returns 400 with a field-level error array for a missing lessonId', async () => {
    const res = await request(app)
      .post('/api/v1/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId });
 
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'lessonId')).toBe(true);
  });
 
  it('still succeeds for a well-formed request (regression check)', async () => {
    const res = await request(app)
      .post('/api/v1/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId, lessonId });
 
    expect(res.status).toBe(200);
    expect(res.body.progress.completionPercentage).toBe(100);
 
    const saved = await Progress.findOne({ course: courseId });
    expect(saved.completedLessons).toHaveLength(1);
  });
});
 