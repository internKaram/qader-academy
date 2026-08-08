const mongoose = require('mongoose');
const axios = require('axios');
const { connect, clearDatabase, closeDatabase } = require('./setup');
const Progress = require('../models/Progress');
const { checkAndTriggerCertificate } = require('../services/certificateService');
 
jest.mock('axios');
 
 
const User =
  mongoose.models.User ||
  mongoose.model(
    'User',
    new mongoose.Schema({
      name: String,
      email: String,
      role: { type: String, default: 'student' },
    })
  );
 
const Course =
  mongoose.models.Course ||
  mongoose.model('Course', new mongoose.Schema({ title: String }));
 
const Lesson =
  mongoose.models.Lesson ||
  mongoose.model(
    'Lesson',
    new mongoose.Schema({
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      title: String,
    })
  );
 

const CertificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateNumber: { type: String, required: true },
  },
  { timestamps: true }
);
CertificateSchema.index({ student: 1, course: 1 }, { unique: true });
 
const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
 
// --- Test setup -----------------------------------------------------------
 
beforeAll(async () => {
  await connect();

  await Certificate.createIndexes();
});
 
afterEach(async () => {
  await clearDatabase();
});
 
afterAll(async () => {
  await closeDatabase();
});
 
describe('checkAndTriggerCertificate — idempotency via unique index', () => {
  let studentId;
  let courseId;
  let lessonId;
 
  beforeEach(async () => {
    const student = await User.create({
      name: 'Sabrin Alqarni',
      email: 'sabrin@qader.com',
      role: 'student',
    });
    const course = await Course.create({ title: 'Test Course' });
    const lesson = await Lesson.create({ course: course._id, title: 'Only Lesson' });
 
    studentId = student._id;
    courseId = course._id;
    lessonId = lesson._id;
 
    // Student has completed the course's only lesson — the precondition
    // checkAndTriggerCertificate needs before it will attempt issuance.
    await Progress.create({
      student: studentId,
      course: courseId,
      completedLessons: [{ lesson: lessonId, completedAt: new Date() }],
    });
 
    axios.post.mockImplementation(async () => {
      try {
        const cert = await Certificate.create({
          student: studentId,
          course: courseId,
          certificateNumber: `QA-TEST-${studentId}`,
        });
        return { status: 201, data: cert.toObject() };
      } catch (err) {
        if (err.code === 11000) {
          const httpError = new Error('Duplicate certificate');
          httpError.response = { status: 409, data: { code: 11000, message: 'E11000 duplicate key' } };
          throw httpError;
        }
        throw err;
      }
    });
  });
 
  it('creates exactly one certificate when triggered twice in a row', async () => {
    const first = await checkAndTriggerCertificate({ studentId, courseId, quizPassed: true });
    const second = await checkAndTriggerCertificate({ studentId, courseId, quizPassed: true });
 
    expect(first.triggered).toBe(true);
    expect(first.isNewlyIssued).toBe(true);
 
    expect(second.triggered).toBe(true);
    expect(second.isNewlyIssued).toBe(false);
 
    // The actual proof, via a direct Mongoose/mongosh-equivalent query:
    // db.certificates.countDocuments({ student, course }) === 1
    const count = await Certificate.countDocuments({ student: studentId, course: courseId });
    expect(count).toBe(1);
  });
 
  it('does not trigger at all if the quiz was not passed', async () => {
    const result = await checkAndTriggerCertificate({ studentId, courseId, quizPassed: false });
 
    expect(result.triggered).toBe(false);
 
    const count = await Certificate.countDocuments({ student: studentId, course: courseId });
    expect(count).toBe(0);
  });
 
  it('does not trigger if lessons are incomplete, even if the quiz was passed', async () => {
    // Reset progress to zero completed lessons for this scenario.
    await Progress.findOneAndUpdate(
      { student: studentId, course: courseId },
      { completedLessons: [] }
    );
 
    const result = await checkAndTriggerCertificate({ studentId, courseId, quizPassed: true });
 
    expect(result.triggered).toBe(false);
    expect(result.reason).toBe('lessons incomplete');
 
    const count = await Certificate.countDocuments({ student: studentId, course: courseId });
    expect(count).toBe(0);
  });
});