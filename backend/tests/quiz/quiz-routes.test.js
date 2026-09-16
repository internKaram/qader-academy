const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { connect, clearDatabase, closeDatabase } = require('../setup');
const Quiz = require('../../models/Quiz');
const QuizAttempt = require('../../models/QuizAttempt');
const User = require('../../models/User');
const Course = require('../../models/Course');
const quizRoutes = require('../../routes/quiz-routes');

const app = express();
app.use(express.json());
app.use('/api/v1/quizzes', quizRoutes);

const tokenFor = (userId, role) =>
  jwt.sign({ userId: userId.toString(), role }, process.env.JWT_SECRET, { expiresIn: '1h' });

const ownerId = new mongoose.Types.ObjectId();
const otherInstructorId = new mongoose.Types.ObjectId();
const ownerToken = () => tokenFor(ownerId, 'instructor');
const otherToken = () => tokenFor(otherInstructorId, 'instructor');
const adminToken = () => tokenFor(new mongoose.Types.ObjectId(), 'admin');
const studentToken = () => tokenFor(new mongoose.Types.ObjectId(), 'student');

const makeQuestion = (overrides = {}) => ({
  text: 'What does the CPU fetch first?',
  options: ['Data', 'The next instruction', 'A register', 'The cache'],
  correctIndex: 1,
  ...overrides,
});

const quizBody = (courseId, overrides = {}) => ({
  courseId: courseId.toString(),
  title: 'Computer Architecture Quiz',
  passingScore: 80,
  questions: [makeQuestion()],
  ...overrides,
});

// A graded attempt on the quiz's first question (correct answer is index 1)
const makeAttempt = (quiz, studentId, { selectedIndex = 1, createdAt } = {}) => {
  const isCorrect = selectedIndex === 1;
  return {
    quizId: quiz._id,
    courseId: quiz.courseId,
    studentId,
    answers: [{
      questionId: quiz.questions[0]._id,
      questionText: quiz.questions[0].text,
      options: quiz.questions[0].options,
      selectedIndex,
      correctIndex: 1,
      isCorrect,
    }],
    correctCount: isCorrect ? 1 : 0,
    totalQuestions: 1,
    scorePercent: isCorrect ? 100 : 0,
    passingScore: 80,
    passed: isCorrect,
    ...(createdAt && { createdAt }),
  };
};

let course;

beforeAll(async () => {
  await connect();
  await Quiz.syncIndexes();
});

beforeEach(async () => {
  course = await Course.create({
    title: 'Computer Architecture',
    description: 'CPUs and memory',
    category: 'CS',
    instructorId: ownerId,
    price: 0,
  });
});

afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('POST /api/v1/quizzes', () => {
  it('lets the course owner create a quiz linked to the course', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${ownerToken()}`)
      .send(quizBody(course._id));

    expect(res.status).toBe(201);
    expect(res.body.courseId).toBe(course._id.toString());
    expect(res.body.passingScore).toBe(80);
    expect(res.body.questions[0].correctIndex).toBe(1);

    const saved = await Quiz.findOne({ courseId: course._id }).select('+questions.correctIndex').lean();
    expect(saved.title).toBe('Computer Architecture Quiz');
    expect(saved.questions[0].correctIndex).toBe(1);
  });

  it('defaults passingScore to 70 when it is not sent', async () => {
    const body = quizBody(course._id);
    delete body.passingScore;

    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${ownerToken()}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.passingScore).toBe(70);
  });

  it('returns field errors for invalid questions', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${ownerToken()}`)
      .send(quizBody(course._id, {
        title: '',
        questions: [makeQuestion({ text: '', options: ['A', 'B', 'C'], correctIndex: 5 })],
      }));

    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining([
      'title',
      'questions[0].text',
      'questions[0].options',
      'questions[0].correctIndex',
    ]));
    expect(await Quiz.countDocuments()).toBe(0);
  });

  it('rejects a quiz with no questions', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${ownerToken()}`)
      .send(quizBody(course._id, { questions: [] }));

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('questions');
  });

  it('creates a separate new quiz each time, all linked to the same course', async () => {
    const first = await request(app).post('/api/v1/quizzes').set('Authorization', `Bearer ${ownerToken()}`).send(quizBody(course._id));
    const second = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${ownerToken()}`)
      .send(quizBody(course._id, { title: 'Midterm' }));

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body._id).not.toBe(first.body._id);
    expect(await Quiz.countDocuments({ courseId: course._id })).toBe(2);
  });

  it('returns 404 for a course that does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${ownerToken()}`)
      .send(quizBody(new mongoose.Types.ObjectId()));

    expect(res.status).toBe(404);
  });

  it('blocks instructors who do not own the course', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${otherToken()}`)
      .send(quizBody(course._id));

    expect(res.status).toBe(403);
  });

  it('blocks students and anonymous users', async () => {
    const asStudent = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${studentToken()}`)
      .send(quizBody(course._id));
    const anonymous = await request(app).post('/api/v1/quizzes').send(quizBody(course._id));

    expect(asStudent.status).toBe(403);
    expect(anonymous.status).toBe(401);
  });

  it('lets an admin create a quiz for any course', async () => {
    const res = await request(app)
      .post('/api/v1/quizzes')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send(quizBody(course._id));

    expect(res.status).toBe(201);
  });
});

describe('GET /api/v1/quizzes/course/:courseId', () => {
  it('lists every quiz in the course, newest first, with correct answers and student counts', async () => {
    const older = await Quiz.create(quizBody(course._id, { title: 'Older quiz' }));
    await new Promise((resolve) => setTimeout(resolve, 5));
    const newer = await Quiz.create(quizBody(course._id, { title: 'Newer quiz' }));
    await Quiz.create(quizBody(new mongoose.Types.ObjectId(), { title: 'Other course quiz' }));

    const studentId = new mongoose.Types.ObjectId();
    await QuizAttempt.create([makeAttempt(older, studentId), makeAttempt(older, studentId)]);

    const res = await request(app)
      .get(`/api/v1/quizzes/course/${course._id}`)
      .set('Authorization', `Bearer ${ownerToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.map((q) => q.title)).toEqual(['Newer quiz', 'Older quiz']);
    expect(res.body[0]._id).toBe(newer._id.toString());
    expect(res.body[0].questions[0].correctIndex).toBe(1);
    expect(res.body[0].studentCount).toBe(0);
    expect(res.body[1].studentCount).toBe(1);
  });

  it('returns an empty list when the course has no quizzes', async () => {
    const res = await request(app)
      .get(`/api/v1/quizzes/course/${course._id}`)
      .set('Authorization', `Bearer ${ownerToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('blocks instructors who do not own the course', async () => {
    const res = await request(app)
      .get(`/api/v1/quizzes/course/${course._id}`)
      .set('Authorization', `Bearer ${otherToken()}`);

    expect(res.status).toBe(403);
  });

  it('rejects an invalid course id', async () => {
    const res = await request(app)
      .get('/api/v1/quizzes/course/not-an-id')
      .set('Authorization', `Bearer ${ownerToken()}`);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/quizzes/:quizId', () => {
  it('returns one quiz with correct answers to the owner', async () => {
    const quiz = await Quiz.create(quizBody(course._id));

    const res = await request(app)
      .get(`/api/v1/quizzes/${quiz._id}`)
      .set('Authorization', `Bearer ${ownerToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Computer Architecture Quiz');
    expect(res.body.questions[0].correctIndex).toBe(1);
  });

  it('returns 404 for a quiz that does not exist', async () => {
    const res = await request(app)
      .get(`/api/v1/quizzes/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${ownerToken()}`);

    expect(res.status).toBe(404);
  });

  it('blocks instructors who do not own the course', async () => {
    const quiz = await Quiz.create(quizBody(course._id));

    const res = await request(app)
      .get(`/api/v1/quizzes/${quiz._id}`)
      .set('Authorization', `Bearer ${otherToken()}`);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/v1/quizzes/:quizId/attempts', () => {
  it('returns the latest attempt of each student with their answers', async () => {
    const quiz = await Quiz.create(quizBody(course._id));
    const sara = await User.create({ name: 'Sara', email: 'sara@test.com', passwordHash: 'x', role: 'student' });
    const omar = await User.create({ name: 'Omar', email: 'omar@test.com', passwordHash: 'x', role: 'student' });

    await QuizAttempt.create(makeAttempt(quiz, sara._id, { selectedIndex: 0, createdAt: new Date('2026-01-01') }));
    await QuizAttempt.create(makeAttempt(quiz, sara._id, { selectedIndex: 1, createdAt: new Date('2026-01-03') }));
    await QuizAttempt.create(makeAttempt(quiz, omar._id, { selectedIndex: 2, createdAt: new Date('2026-01-02') }));

    const res = await request(app)
      .get(`/api/v1/quizzes/${quiz._id}/attempts`)
      .set('Authorization', `Bearer ${ownerToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    const [first, second] = res.body; // newest submission first
    expect(first.student).toMatchObject({ name: 'Sara', email: 'sara@test.com' });
    expect(first.attemptCount).toBe(2);
    expect(first.passed).toBe(true);
    expect(first.scorePercent).toBe(100);
    expect(first.answers[0]).toMatchObject({ selectedIndex: 1, correctIndex: 1, isCorrect: true });

    expect(second.student.name).toBe('Omar');
    expect(second.attemptCount).toBe(1);
    expect(second.passed).toBe(false);
    expect(second.answers[0].selectedIndex).toBe(2);
  });

  it('returns an empty list when nobody has taken the quiz', async () => {
    const quiz = await Quiz.create(quizBody(course._id));

    const res = await request(app)
      .get(`/api/v1/quizzes/${quiz._id}/attempts`)
      .set('Authorization', `Bearer ${ownerToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('blocks instructors who do not own the course', async () => {
    const quiz = await Quiz.create(quizBody(course._id));

    const res = await request(app)
      .get(`/api/v1/quizzes/${quiz._id}/attempts`)
      .set('Authorization', `Bearer ${otherToken()}`);

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/v1/quizzes/:quizId', () => {
  it('replaces the title, passing score and questions', async () => {
    const quiz = await Quiz.create(quizBody(course._id));

    const res = await request(app)
      .put(`/api/v1/quizzes/${quiz._id}`)
      .set('Authorization', `Bearer ${ownerToken()}`)
      .send({
        title: 'Updated quiz',
        passingScore: 50,
        questions: [makeQuestion({ correctIndex: 3 }), makeQuestion({ text: 'Second?', correctIndex: 0 })],
      });

    expect(res.status).toBe(200);

    const saved = await Quiz.findById(quiz._id).select('+questions.correctIndex').lean();
    expect(saved.title).toBe('Updated quiz');
    expect(saved.passingScore).toBe(50);
    expect(saved.questions).toHaveLength(2);
    expect(saved.questions.map((q) => q.correctIndex)).toEqual([3, 0]);
    expect(saved.courseId.toString()).toBe(course._id.toString());
  });

  it('returns 404 for a quiz that does not exist', async () => {
    const res = await request(app)
      .put(`/api/v1/quizzes/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${ownerToken()}`)
      .send({ title: 'x', questions: [makeQuestion()] });

    expect(res.status).toBe(404);
  });

  it('blocks instructors who do not own the course', async () => {
    const quiz = await Quiz.create(quizBody(course._id));

    const res = await request(app)
      .put(`/api/v1/quizzes/${quiz._id}`)
      .set('Authorization', `Bearer ${otherToken()}`)
      .send({ title: 'Hijacked', questions: [makeQuestion()] });

    expect(res.status).toBe(403);
    expect((await Quiz.findById(quiz._id).lean()).title).toBe('Computer Architecture Quiz');
  });
});

describe('DELETE /api/v1/quizzes/:quizId', () => {
  it('lets the owner delete the quiz and its attempts, leaving other quizzes alone', async () => {
    const quiz = await Quiz.create(quizBody(course._id));
    const otherQuiz = await Quiz.create(quizBody(course._id, { title: 'Keep me' }));
    const studentId = new mongoose.Types.ObjectId();
    await QuizAttempt.create([makeAttempt(quiz, studentId), makeAttempt(otherQuiz, studentId)]);

    const res = await request(app)
      .delete(`/api/v1/quizzes/${quiz._id}`)
      .set('Authorization', `Bearer ${ownerToken()}`);

    expect(res.status).toBe(200);
    expect(await Quiz.findById(quiz._id)).toBeNull();
    expect(await Quiz.findById(otherQuiz._id)).not.toBeNull();
    expect(await QuizAttempt.countDocuments({ quizId: quiz._id })).toBe(0);
    expect(await QuizAttempt.countDocuments({ quizId: otherQuiz._id })).toBe(1);
  });

  it('blocks instructors who do not own the course', async () => {
    const quiz = await Quiz.create(quizBody(course._id));

    const res = await request(app)
      .delete(`/api/v1/quizzes/${quiz._id}`)
      .set('Authorization', `Bearer ${otherToken()}`);

    expect(res.status).toBe(403);
    expect(await Quiz.findById(quiz._id)).not.toBeNull();
  });

  it('returns 404 for a quiz that does not exist', async () => {
    const res = await request(app)
      .delete(`/api/v1/quizzes/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${ownerToken()}`);

    expect(res.status).toBe(404);
  });
});
