const mongoose = require('mongoose');
const { connect, clearDatabase, closeDatabase } = require('../setup');
const Quiz = require('../../models/Quiz');

const makeQuestion = (overrides = {}) => ({
  text: 'What does JSX compile to?',
  options: ['HTML', 'React.createElement calls', 'CSS', 'JSON'],
  correctIndex: 1,
  ...overrides,
});

const makeQuiz = (overrides = {}) => ({
  courseId: new mongoose.Types.ObjectId(),
  title: 'React Basics Quiz',
  questions: [makeQuestion()],
  ...overrides,
});

beforeAll(async () => {
  await connect();
  await Quiz.syncIndexes();
});
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Quiz model', () => {
  it('saves a valid quiz with a default passingScore of 70', async () => {
    const quiz = await Quiz.create(makeQuiz());

    expect(quiz._id).toBeDefined();
    expect(quiz.passingScore).toBe(70);
    expect(quiz.questions).toHaveLength(1);
    expect(quiz.questions[0]._id).toBeDefined();
    expect(quiz.createdAt).toBeDefined();
  });

  it('requires courseId and title', async () => {
    await expect(
      Quiz.create(makeQuiz({ courseId: undefined, title: undefined }))
    ).rejects.toThrow(/courseId.*required|title.*required/);
  });

  it('rejects a quiz with no questions', async () => {
    await expect(Quiz.create(makeQuiz({ questions: [] }))).rejects.toThrow(
      'A quiz must have at least 1 question'
    );
  });

  it('rejects a question that does not have exactly 4 options', async () => {
    const quiz = makeQuiz({ questions: [makeQuestion({ options: ['A', 'B', 'C'] })] });
    await expect(Quiz.create(quiz)).rejects.toThrow('exactly 4 options');
  });

  it('rejects a question with no options', async () => {
    const quiz = makeQuiz({ questions: [makeQuestion({ options: undefined })] });
    await expect(Quiz.create(quiz)).rejects.toThrow('exactly 4 options');
  });

  it('rejects a missing or out-of-range correctIndex', async () => {
    await expect(
      Quiz.create(makeQuiz({ questions: [makeQuestion({ correctIndex: undefined })] }))
    ).rejects.toThrow(/correctIndex.*required/);
    await expect(
      Quiz.create(makeQuiz({ questions: [makeQuestion({ correctIndex: 4 })] }))
    ).rejects.toThrow(/correctIndex/);
    await expect(
      Quiz.create(makeQuiz({ questions: [makeQuestion({ correctIndex: -1 })] }))
    ).rejects.toThrow(/correctIndex/);
  });

  it('rejects a passingScore outside 0-100', async () => {
    await expect(Quiz.create(makeQuiz({ passingScore: 101 }))).rejects.toThrow(/passingScore/);
    await expect(Quiz.create(makeQuiz({ passingScore: -1 }))).rejects.toThrow(/passingScore/);
  });

  it('allows many quizzes in the same course', async () => {
    const courseId = new mongoose.Types.ObjectId();
    await Quiz.create(makeQuiz({ courseId }));
    await Quiz.create(makeQuiz({ courseId, title: 'Second quiz' }));

    expect(await Quiz.countDocuments({ courseId })).toBe(2);
  });

  it('hides correctIndex from queries by default', async () => {
    const { _id } = await Quiz.create(makeQuiz());

    const quiz = await Quiz.findById(_id).lean();
    expect(quiz.questions[0].text).toBe('What does JSX compile to?');
    expect(quiz.questions[0].options).toHaveLength(4);
    expect(quiz.questions[0]).not.toHaveProperty('correctIndex');
  });

  it('returns correctIndex only when explicitly selected (for grading)', async () => {
    const { _id } = await Quiz.create(makeQuiz());

    const quiz = await Quiz.findById(_id).select('+questions.correctIndex').lean();
    expect(quiz.questions[0].correctIndex).toBe(1);
    expect(quiz.title).toBe('React Basics Quiz');
  });
});
