const mongoose = require('mongoose');
const { gradeQuiz, QuizGradingError } = require('../../services/quiz-grading');

// Builds a quiz with `count` questions. Question i has id "q<i>" and its correct
// answer at (i % 4), so tests can pick right or wrong answers predictably.
const buildQuiz = (count, passingScore = 70) => ({
  passingScore,
  questions: Array.from({ length: count }, (_, i) => ({
    _id: `q${i}`,
    text: `Question ${i}`,
    options: ['A', 'B', 'C', 'D'],
    correctIndex: i % 4,
  })),
});

const right = (quiz, i) => ({ questionId: quiz.questions[i]._id, selectedIndex: quiz.questions[i].correctIndex });
const wrong = (quiz, i) => ({ questionId: quiz.questions[i]._id, selectedIndex: (quiz.questions[i].correctIndex + 1) % 4 });

// Answers the first `correct` questions right and the rest wrong
const submission = (quiz, correct) => quiz.questions.map((_, i) => (i < correct ? right(quiz, i) : wrong(quiz, i)));

// Runs gradeQuiz and returns the error it throws
const gradingError = (quiz, answers) => {
  try {
    gradeQuiz(quiz, answers);
  } catch (error) {
    return error;
  }
  throw new Error('expected gradeQuiz to throw');
};

describe('gradeQuiz: score', () => {
  it('gives 100% and a pass when every answer is right', () => {
    const quiz = buildQuiz(4);
    const result = gradeQuiz(quiz, submission(quiz, 4));

    expect(result).toMatchObject({ correctCount: 4, totalQuestions: 4, scorePercent: 100, passingScore: 70, passed: true });
    expect(result.answers.every((a) => a.isCorrect)).toBe(true);
  });

  it('gives 0% and a fail when every answer is wrong', () => {
    const quiz = buildQuiz(4);
    const result = gradeQuiz(quiz, submission(quiz, 0));

    expect(result).toMatchObject({ correctCount: 0, totalQuestions: 4, scorePercent: 0, passed: false });
    expect(result.answers.some((a) => a.isCorrect)).toBe(false);
  });

  it('counts only the right answers in a mixed submission', () => {
    const quiz = buildQuiz(4);
    const result = gradeQuiz(quiz, [right(quiz, 0), wrong(quiz, 1), right(quiz, 2), right(quiz, 3)]);

    expect(result.correctCount).toBe(3);
    expect(result.scorePercent).toBe(75);
    expect(result.answers.map((a) => a.isCorrect)).toEqual([true, false, true, true]);
  });

  it('works for a one-question quiz', () => {
    const quiz = buildQuiz(1);
    expect(gradeQuiz(quiz, [right(quiz, 0)])).toMatchObject({ correctCount: 1, scorePercent: 100, passed: true });
    expect(gradeQuiz(quiz, [wrong(quiz, 0)])).toMatchObject({ correctCount: 0, scorePercent: 0, passed: false });
  });

  it('handles a large quiz (37 of 50 right = 74%)', () => {
    const quiz = buildQuiz(50);
    expect(gradeQuiz(quiz, submission(quiz, 37))).toMatchObject({ correctCount: 37, totalQuestions: 50, scorePercent: 74 });
  });

  // Every possible score for quizzes of 1 to 12 questions matches the formula
  it('scores every possible result for 1 to 12 questions correctly', () => {
    for (let total = 1; total <= 12; total += 1) {
      const quiz = buildQuiz(total);
      for (let correct = 0; correct <= total; correct += 1) {
        const result = gradeQuiz(quiz, submission(quiz, correct));
        expect(result.correctCount).toBe(correct);
        expect(result.totalQuestions).toBe(total);
        expect(result.scorePercent).toBeCloseTo((correct / total) * 100, 2);
        expect(result.scorePercent).toBeGreaterThanOrEqual(0);
        expect(result.scorePercent).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('gradeQuiz: rounding scorePercent to 2 decimals', () => {
  it.each([
    [1, 3, 33.33],
    [2, 3, 66.67],
    [1, 6, 16.67],
    [5, 6, 83.33],
    [1, 7, 14.29],
    [1, 8, 12.5],
    [7, 9, 77.78],
    [7, 10, 70],
    [1, 32, 3.13],
  ])('%i of %i right = %d%%', (correct, total, expected) => {
    const quiz = buildQuiz(total);
    expect(gradeQuiz(quiz, submission(quiz, correct)).scorePercent).toBe(expected);
  });
});

describe('gradeQuiz: pass / fail', () => {
  it.each([
    // [correct, total, passingScore, passed]
    [7, 10, 70, true],   // exactly on the line passes
    [6, 10, 70, false],  // just under
    [3, 5, 60, true],
    [14, 20, 70, true],
    [13, 20, 70, false],
    [2, 3, 66, true],    // 66.67% >= 66
    [2, 3, 67, false],   // 66.67% < 67: uses the exact fraction, not the rounded percent
    [29, 100, 29, true],
    [57, 100, 57, true], // 57/100*100 is 56.99999999999999 in JS
    [9, 10, 100, false], // 100% needed
    [10, 10, 100, true],
    [0, 5, 0, true],     // passing score 0 always passes
    [1, 3, 34, false],   // 33.33% < 34
    [1, 3, 33, true],
  ])('%i of %i right with passingScore %i -> passed %s', (correct, total, passingScore, passed) => {
    const quiz = buildQuiz(total, passingScore);
    const result = gradeQuiz(quiz, submission(quiz, correct));

    expect(result.passed).toBe(passed);
    expect(result.passingScore).toBe(passingScore);
  });
});

describe('gradeQuiz: skipped questions', () => {
  it('counts a question left out of the submission as wrong', () => {
    const quiz = buildQuiz(4);
    const result = gradeQuiz(quiz, [right(quiz, 0), right(quiz, 2)]);

    expect(result.correctCount).toBe(2);
    expect(result.scorePercent).toBe(50);
    expect(result.answers[1]).toMatchObject({ selectedIndex: null, isCorrect: false });
    expect(result.answers[3]).toMatchObject({ selectedIndex: null, isCorrect: false });
  });

  it('treats selectedIndex null or undefined as skipped', () => {
    const quiz = buildQuiz(2);
    const result = gradeQuiz(quiz, [
      { questionId: 'q0', selectedIndex: null },
      { questionId: 'q1' },
    ]);

    expect(result.correctCount).toBe(0);
    expect(result.answers.map((a) => a.selectedIndex)).toEqual([null, null]);
    expect(result.answers.map((a) => a.isCorrect)).toEqual([false, false]);
  });

  it('gives 0% for an empty submission', () => {
    const quiz = buildQuiz(3);
    expect(gradeQuiz(quiz, [])).toMatchObject({ correctCount: 0, totalQuestions: 3, scorePercent: 0, passed: false });
  });

  it('never treats a skipped question as right, even when the correct answer is option 0', () => {
    const quiz = buildQuiz(1); // q0's correct answer is index 0
    expect(gradeQuiz(quiz, []).answers[0].isCorrect).toBe(false);
  });
});

describe('gradeQuiz: review answers', () => {
  it('returns answers in the quiz order, whatever order they were sent in', () => {
    const quiz = buildQuiz(3);
    const result = gradeQuiz(quiz, [right(quiz, 2), wrong(quiz, 0), right(quiz, 1)]);

    expect(result.answers.map((a) => a.questionId)).toEqual(['q0', 'q1', 'q2']);
    expect(result.answers.map((a) => a.isCorrect)).toEqual([false, true, true]);
  });

  it('copies the question text, options, correct answer and the student pick', () => {
    const quiz = buildQuiz(2);
    const result = gradeQuiz(quiz, [{ questionId: 'q1', selectedIndex: 3 }]);

    expect(result.answers[1]).toEqual({
      questionId: 'q1',
      questionText: 'Question 1',
      options: ['A', 'B', 'C', 'D'],
      selectedIndex: 3,
      correctIndex: 1,
      isCorrect: false,
    });
  });

  it('copies the options instead of sharing the quiz array', () => {
    const quiz = buildQuiz(1);
    const result = gradeQuiz(quiz, []);

    expect(result.answers[0].options).not.toBe(quiz.questions[0].options);
    result.answers[0].options.push('E');
    expect(quiz.questions[0].options).toHaveLength(4);
  });

  it('does not change the quiz or the submitted answers', () => {
    const quiz = buildQuiz(3);
    const answers = [right(quiz, 0), { questionId: 'q1', selectedIndex: null }];
    const quizBefore = JSON.parse(JSON.stringify(quiz));
    const answersBefore = JSON.parse(JSON.stringify(answers));

    gradeQuiz(quiz, answers);

    expect(quiz).toEqual(quizBefore);
    expect(answers).toEqual(answersBefore);
  });

  it('matches ObjectId question ids with string ids from the request', () => {
    const quiz = buildQuiz(2);
    quiz.questions.forEach((q) => { q._id = new mongoose.Types.ObjectId(); });

    const result = gradeQuiz(quiz, [{ questionId: quiz.questions[1]._id.toString(), selectedIndex: 1 }]);

    expect(result.correctCount).toBe(1);
    expect(result.answers[1].isCorrect).toBe(true);
    expect(result.answers[1].questionId).toBe(quiz.questions[1]._id);
  });

  it('grades options by index, even when two options have the same text', () => {
    const quiz = { passingScore: 50, questions: [{ _id: 'q0', text: 'Pick', options: ['Same', 'Same', 'C', 'D'], correctIndex: 1 }] };
    expect(gradeQuiz(quiz, [{ questionId: 'q0', selectedIndex: 0 }]).correctCount).toBe(0);
    expect(gradeQuiz(quiz, [{ questionId: 'q0', selectedIndex: 1 }]).correctCount).toBe(1);
  });
});

describe('gradeQuiz: bad submissions (student errors)', () => {
  const quiz = buildQuiz(2);

  it.each([
    ['not a list', { q0: 1 }, 'answers'],
    ['missing', undefined, 'answers'],
  ])('rejects answers that are %s', (_, answers, field) => {
    const error = gradingError(quiz, answers);
    expect(error).toBeInstanceOf(QuizGradingError);
    expect(error.field).toBe(field);
  });

  it('rejects an answer with no questionId', () => {
    const error = gradingError(quiz, [{ selectedIndex: 1 }]);
    expect(error).toBeInstanceOf(QuizGradingError);
    expect(error.field).toBe('answers[0].questionId');
  });

  it('rejects an answer that is not an object', () => {
    const error = gradingError(quiz, [right(quiz, 0), 'q1']);
    expect(error).toBeInstanceOf(QuizGradingError);
    expect(error.field).toBe('answers[1].questionId');
  });

  it('rejects a question that is not part of the quiz', () => {
    const error = gradingError(quiz, [{ questionId: 'not-in-quiz', selectedIndex: 0 }]);
    expect(error).toBeInstanceOf(QuizGradingError);
    expect(error.field).toBe('answers[0].questionId');
    expect(error.message).toMatch(/no longer part of the quiz/);
  });

  // Otherwise a student could send the right answer and a wrong one for the same question
  it('rejects the same question answered twice', () => {
    const error = gradingError(quiz, [wrong(quiz, 0), right(quiz, 0)]);
    expect(error).toBeInstanceOf(QuizGradingError);
    expect(error.field).toBe('answers[1].questionId');
  });

  it.each([4, -1, 1.5, '1', true, NaN, Infinity, {}])('rejects selectedIndex %p', (selectedIndex) => {
    const error = gradingError(quiz, [{ questionId: 'q0', selectedIndex }]);
    expect(error).toBeInstanceOf(QuizGradingError);
    expect(error.field).toBe('answers[0].selectedIndex');
  });

  it('accepts every valid option index 0 to 3', () => {
    const one = buildQuiz(1);
    [0, 1, 2, 3].forEach((selectedIndex) => {
      expect(() => gradeQuiz(one, [{ questionId: 'q0', selectedIndex }])).not.toThrow();
    });
  });
});

describe('gradeQuiz: broken quiz data (server errors)', () => {
  const expectServerError = (quiz) => {
    const error = gradingError(quiz, []);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(QuizGradingError);
  };

  it('refuses a quiz with no questions (avoids dividing by zero)', () => {
    expectServerError({ passingScore: 70, questions: [] });
    expectServerError({ passingScore: 70 });
    expectServerError(null);
  });

  it.each([undefined, -1, 101, 70.5, '70'])('refuses passingScore %p', (passingScore) => {
    expectServerError({ ...buildQuiz(1), passingScore });
  });

  // e.g. the quiz was loaded without .select('+questions.correctIndex')
  it('refuses a question with no correct answer loaded', () => {
    const quiz = buildQuiz(2);
    delete quiz.questions[1].correctIndex;
    expectServerError(quiz);
  });

  it('refuses a correctIndex outside the options', () => {
    const quiz = buildQuiz(1);
    quiz.questions[0].correctIndex = 4;
    expectServerError(quiz);
  });

  it('refuses a question without options or an id', () => {
    const noOptions = buildQuiz(1);
    noOptions.questions[0].options = [];
    expectServerError(noOptions);

    const noId = buildQuiz(1);
    delete noId.questions[0]._id;
    expectServerError(noId);
  });
});
