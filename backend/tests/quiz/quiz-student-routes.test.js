const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { connect, clearDatabase, closeDatabase } = require('../setup');
const Quiz = require('../../models/Quiz');
const QuizAttempt = require('../../models/QuizAttempt');
const Enrollment = require('../../models/Enrollment');
const User = require('../../models/User');
const Course = require('../../models/Course');
const quizRoutes = require('../../routes/quiz-routes');

const app = express();
app.use(express.json());
app.use('/api/v1/quizzes', quizRoutes);

const tokenFor = (userId, role) =>
  jwt.sign({ userId: userId.toString(), role }, process.env.JWT_SECRET, { expiresIn: '1h' });

const ownerId = new mongoose.Types.ObjectId();
const ownerToken = () => tokenFor(ownerId, 'instructor');

let course;
let quiz; // 4 questions, correct answers [1, 0, 3, 2], passingScore 75
let student;
let studentToken;

// Answers questions by index: picks[i] is the option chosen for question i (null = skipped)
const answersFor = (picks) => picks.map((selectedIndex, i) => ({
  questionId: quiz.questions[i]._id.toString(),
  selectedIndex,
}));

const CORRECT = [1, 0, 3, 2];

const take = (token = studentToken, quizId = quiz._id) =>
  request(app).get(`/api/v1/quizzes/${quizId}/take`).set('Authorization', `Bearer ${token}`);

const submit = (answers, token = studentToken, quizId = quiz._id) =>
  request(app).post(`/api/v1/quizzes/${quizId}/attempts`).set('Authorization', `Bearer ${token}`).send({ answers });

const review = (attemptId, token = studentToken, quizId = quiz._id) =>
  request(app).get(`/api/v1/quizzes/${quizId}/attempts/${attemptId}`).set('Authorization', `Bearer ${token}`);

const makeStudent = async (name) => {
  const user = await User.create({ name, email: `${name}@test.com`, passwordHash: 'x', role: 'student' });
  return { user, token: tokenFor(user._id, 'student') };
};

beforeAll(async () => {
  await connect();
});

beforeEach(async () => {
  course = await Course.create({
    title: 'Computer Architecture',
    description: 'CPUs and memory',
    category: 'CS',
    instructorId: ownerId,
    price: 0,
  });

  quiz = await Quiz.create({
    courseId: course._id,
    title: 'CPU Basics',
    passingScore: 75,
    questions: CORRECT.map((correctIndex, i) => ({
      text: `Question ${i + 1}`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex,
    })),
  });

  const made = await makeStudent('student');
  student = made.user;
  studentToken = made.token;
  await Enrollment.create({ studentId: student._id, courseId: course._id });
});

afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('GET /api/v1/quizzes/:quizId/take', () => {
  it('gives an enrolled student the questions without correct answers', async () => {
    const res = await take();

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      _id: quiz._id.toString(),
      courseId: course._id.toString(),
      title: 'CPU Basics',
      passingScore: 75,
      totalQuestions: 4,
    });
    expect(res.body.questions).toHaveLength(4);
    expect(res.body.questions[0]).toEqual({
      _id: quiz.questions[0]._id.toString(),
      text: 'Question 1',
      options: ['A', 'B', 'C', 'D'],
    });
    expect(JSON.stringify(res.body)).not.toContain('correctIndex');
  });

  it('lets a student who completed the course still take it', async () => {
    await Enrollment.updateOne({ studentId: student._id }, { status: 'completed' });
    expect((await take()).status).toBe(200);
  });

  it('blocks a student who is not enrolled', async () => {
    const other = await makeStudent('outsider');
    const res = await take(other.token);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/enrolled/);
  });

  it('blocks a student enrolled in a different course', async () => {
    const other = await makeStudent('elsewhere');
    await Enrollment.create({ studentId: other.user._id, courseId: new mongoose.Types.ObjectId() });
    expect((await take(other.token)).status).toBe(403);
  });

  it('blocks a suspended enrollment', async () => {
    await Enrollment.updateOne({ studentId: student._id }, { status: 'suspended' });
    expect((await take()).status).toBe(403);
  });

  it('is for students only (instructors use the edit page)', async () => {
    expect((await take(ownerToken())).status).toBe(403);
  });

  it('requires login', async () => {
    const res = await request(app).get(`/api/v1/quizzes/${quiz._id}/take`);
    expect(res.status).toBe(401);
  });

  it('returns 404 for a quiz that does not exist', async () => {
    expect((await take(studentToken, new mongoose.Types.ObjectId())).status).toBe(404);
  });

  it('returns 400 for an invalid quiz id', async () => {
    const res = await take(studentToken, 'not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('quizId');
  });
});

describe('POST /api/v1/quizzes/:quizId/attempts', () => {
  it('grades the answers on the server and saves the attempt', async () => {
    // right, right, wrong, right = 3 of 4 = 75% -> passes at 75
    const res = await submit(answersFor([1, 0, 0, 2]));

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      quizId: quiz._id.toString(),
      courseId: course._id.toString(),
      quizTitle: 'CPU Basics',
      correctCount: 3,
      totalQuestions: 4,
      scorePercent: 75,
      passingScore: 75,
      passed: true,
    });
    expect(res.body.submittedAt).toBeDefined();
    expect(res.body.answers.map((a) => a.isCorrect)).toEqual([true, true, false, true]);
    // The review shows the right answer for each question
    expect(res.body.answers[2]).toMatchObject({ questionText: 'Question 3', selectedIndex: 0, correctIndex: 3, isCorrect: false });

    const saved = await QuizAttempt.findById(res.body._id).lean();
    expect(saved.studentId.toString()).toBe(student._id.toString());
    expect(saved.courseId.toString()).toBe(course._id.toString());
    expect(saved).toMatchObject({ correctCount: 3, totalQuestions: 4, scorePercent: 75, passed: true });
    expect(saved.answers).toHaveLength(4);
  });

  it('fails a student below the passing score', async () => {
    const res = await submit(answersFor([1, 0, 0, 0])); // 2 of 4 = 50%
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ correctCount: 2, scorePercent: 50, passed: false });
  });

  it('counts skipped questions as wrong', async () => {
    const res = await submit(answersFor([1, null])); // q1 right, q2 skipped, q3 and q4 not sent

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ correctCount: 1, totalQuestions: 4, scorePercent: 25, passed: false });
    expect(res.body.answers.map((a) => a.selectedIndex)).toEqual([1, null, null, null]);
  });

  it('ignores any score, pass result or correct answer the client sends', async () => {
    const res = await request(app)
      .post(`/api/v1/quizzes/${quiz._id}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: answersFor([0, 1, 0, 1]).map((a) => ({ ...a, isCorrect: true, correctIndex: a.selectedIndex })),
        correctCount: 4,
        scorePercent: 100,
        passed: true,
        studentId: new mongoose.Types.ObjectId().toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ correctCount: 0, scorePercent: 0, passed: false });
    const saved = await QuizAttempt.findById(res.body._id).lean();
    expect(saved.studentId.toString()).toBe(student._id.toString());
    expect(saved.answers.map((a) => a.correctIndex)).toEqual(CORRECT);
  });

  it('accepts selectedIndex sent as a number string', async () => {
    const res = await submit(answersFor(['1', '0', '3', '2']));
    expect(res.status).toBe(201);
    expect(res.body.correctCount).toBe(4);
  });

  it('keeps every retake, and the instructor results show the newest one', async () => {
    const first = await submit(answersFor([0, 0, 0, 0]));
    const second = await submit(answersFor(CORRECT));

    expect(first.body.passed).toBe(false);
    expect(second.body.passed).toBe(true);
    expect(await QuizAttempt.countDocuments({ quizId: quiz._id, studentId: student._id })).toBe(2);

    const results = await request(app)
      .get(`/api/v1/quizzes/${quiz._id}/attempts`)
      .set('Authorization', `Bearer ${ownerToken()}`);
    expect(results.status).toBe(200);
    expect(results.body).toHaveLength(1);
    expect(results.body[0]).toMatchObject({ _id: second.body._id, attemptCount: 2, scorePercent: 100, passed: true });
  });

  it('saves the question text so the review survives the quiz being edited', async () => {
    const res = await submit(answersFor(CORRECT));

    await Quiz.updateOne({ _id: quiz._id }, { $set: { 'questions.0.text': 'Edited question' } });

    const saved = await QuizAttempt.findById(res.body._id).lean();
    expect(saved.answers[0].questionText).toBe('Question 1');
  });

  it('blocks a student who is not enrolled and saves nothing', async () => {
    const other = await makeStudent('outsider');
    const res = await submit(answersFor(CORRECT), other.token);

    expect(res.status).toBe(403);
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('is for students only', async () => {
    expect((await submit(answersFor(CORRECT), ownerToken())).status).toBe(403);
    expect((await submit(answersFor(CORRECT), tokenFor(new mongoose.Types.ObjectId(), 'admin'))).status).toBe(403);
  });

  it('requires login', async () => {
    const res = await request(app).post(`/api/v1/quizzes/${quiz._id}/attempts`).send({ answers: [] });
    expect(res.status).toBe(401);
  });

  it('returns 404 for a quiz that does not exist', async () => {
    expect((await submit([], studentToken, new mongoose.Types.ObjectId())).status).toBe(404);
  });

  it('returns field errors for badly shaped answers', async () => {
    const res = await submit([
      { questionId: 'nope', selectedIndex: 1 },
      { questionId: quiz.questions[1]._id.toString(), selectedIndex: 7 },
    ]);

    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toEqual(expect.arrayContaining([
      'answers[0].questionId',
      'answers[1].selectedIndex',
    ]));
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects answers that are not a list', async () => {
    const res = await request(app)
      .post(`/api/v1/quizzes/${quiz._id}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers: 'all of them' });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('answers');
  });

  it('rejects a question from another quiz (e.g. the quiz changed mid-attempt)', async () => {
    const res = await submit([{ questionId: new mongoose.Types.ObjectId().toString(), selectedIndex: 1 }]);

    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toMatchObject({ field: 'answers[0].questionId' });
    expect(res.body.errors[0].message).toMatch(/Reload the quiz/);
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });

  it('rejects the same question answered twice', async () => {
    const questionId = quiz.questions[0]._id.toString();
    const res = await submit([{ questionId, selectedIndex: 0 }, { questionId, selectedIndex: 1 }]);

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('answers[1].questionId');
    expect(await QuizAttempt.countDocuments()).toBe(0);
  });
});

describe('GET /api/v1/quizzes/:quizId/attempts/:attemptId', () => {
  it("returns the student's own result and review", async () => {
    const submitted = await submit(answersFor([1, 0, 0, null]));
    const res = await review(submitted.body._id);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      _id: submitted.body._id,
      quizId: quiz._id.toString(),
      courseId: course._id.toString(),
      quizTitle: 'CPU Basics',
      correctCount: 2,
      totalQuestions: 4,
      scorePercent: 50,
      passingScore: 75,
      passed: false,
      submittedAt: submitted.body.submittedAt,
    });
    expect(res.body.answers).toEqual(submitted.body.answers);
    expect(res.body.answers[3]).toMatchObject({ selectedIndex: null, correctIndex: 2, isCorrect: false });
  });

  it('still works after the student is no longer enrolled', async () => {
    const submitted = await submit(answersFor(CORRECT));
    await Enrollment.deleteMany({ studentId: student._id });

    expect((await review(submitted.body._id)).status).toBe(200);
  });

  it("hides another student's attempt with a 404", async () => {
    const submitted = await submit(answersFor(CORRECT));
    const other = await makeStudent('curious');
    await Enrollment.create({ studentId: other.user._id, courseId: course._id });

    const res = await review(submitted.body._id, other.token);
    expect(res.status).toBe(404);
  });

  it('returns 404 when the attempt belongs to a different quiz', async () => {
    const submitted = await submit(answersFor(CORRECT));
    const res = await review(submitted.body._id, studentToken, new mongoose.Types.ObjectId());
    expect(res.status).toBe(404);
  });

  it('returns 404 for an attempt that does not exist', async () => {
    expect((await review(new mongoose.Types.ObjectId())).status).toBe(404);
  });

  it('returns 400 for invalid ids', async () => {
    const res = await review('bad-attempt', studentToken, 'bad-quiz');
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field)).toEqual(expect.arrayContaining(['quizId', 'attemptId']));
  });

  it('is for students only', async () => {
    const submitted = await submit(answersFor(CORRECT));
    expect((await review(submitted.body._id, ownerToken())).status).toBe(403);
  });
});
