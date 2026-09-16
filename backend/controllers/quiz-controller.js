const Quiz = require("../models/Quiz")
const QuizAttempt = require("../models/QuizAttempt")
const Course = require("../models/Course")
const User = require("../models/User")
const Enrollment = require("../models/Enrollment")
const { gradeQuiz, QuizGradingError } = require("../services/quiz-grading")
const asyncHandler = require("express-async-handler")
const { body, param } = require("express-validator")

// --- validators ---

const quizIdValidator = [
    param("quizId").isMongoId().withMessage("Invalid quiz id"),
]

const courseIdParamValidator = [
    param("courseId").isMongoId().withMessage("Invalid course id"),
]

// Shared rules for the editable part of a quiz (used by create and update)
const quizBodyRules = [
    body("title").trim().notEmpty().withMessage("Quiz title is required"),
    body("passingScore")
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage("Passing score must be a whole number between 0 and 100")
        .toInt(),
    body("questions").isArray({ min: 1 }).withMessage("A quiz must have at least 1 question"),
    body("questions.*.text").trim().notEmpty().withMessage("Question text is required"),
    body("questions.*.options")
        .isArray({ min: 4, max: 4 }).withMessage("A question must have exactly 4 options"),
    body("questions.*.options.*")
        .isString().withMessage("Option must be text")
        .bail().trim().notEmpty().withMessage("Option text is required"),
    body("questions.*.correctIndex")
        .isInt({ min: 0, max: 3 }).withMessage("Choose the correct option")
        .toInt(),
]

const createQuizValidators = [
    body("courseId").isMongoId().withMessage("Invalid course id"),
    ...quizBodyRules,
]

const updateQuizValidators = [
    ...quizIdValidator,
    ...quizBodyRules,
]

// Student submission: { answers: [{ questionId, selectedIndex }] }
// selectedIndex may be null (skipped). Matching answers to the quiz's questions
// is checked by gradeQuiz, which knows the quiz.
const submitAttemptValidators = [
    ...quizIdValidator,
    body("answers").isArray().withMessage("Answers must be a list"),
    body("answers.*.questionId").isMongoId().withMessage("Invalid question id"),
    body("answers.*.selectedIndex")
        .optional({ values: "null" })
        .isInt({ min: 0, max: 3 }).withMessage("Selected option is not valid")
        .toInt(),
]

const attemptParamsValidator = [
    ...quizIdValidator,
    param("attemptId").isMongoId().withMessage("Invalid attempt id"),
]

// --- helpers ---

// Only the instructor who owns the course (or an admin) can manage its quizzes.
// Returns the course, or sends the error response and returns null.
async function findOwnedCourse(courseId, request, response) {
    const course = await Course.findById(courseId).lean()
    if (!course) {
        response.status(404).json({ message: "Course not found" })
        return null
    }
    const isOwner = course.instructorId.toString() === request.user.userId
    if (!isOwner && request.user.role !== "admin") {
        response.status(403).json({ message: "Not authorized to manage quizzes for this course" })
        return null
    }
    return course
}

// Loads a quiz (with correct answers) and checks the caller owns its course.
// Returns the quiz, or sends the error response and returns null.
async function findOwnedQuiz(quizId, request, response, { lean = true } = {}) {
    const query = Quiz.findById(quizId).select("+questions.correctIndex")
    const quiz = lean ? await query.lean() : await query
    if (!quiz) {
        response.status(404).json({ message: "Quiz not found" })
        return null
    }
    const course = await findOwnedCourse(quiz.courseId, request, response)
    return course ? quiz : null
}

// Loads a quiz for a student and checks they are enrolled (not suspended) in its course.
// Returns the quiz, or sends the error response and returns null.
async function findQuizForStudent(quizId, request, response, { withCorrectAnswers = false } = {}) {
    const query = Quiz.findById(quizId)
    if (withCorrectAnswers) query.select("+questions.correctIndex")
    const quiz = await query.lean()
    if (!quiz) {
        response.status(404).json({ message: "Quiz not found" })
        return null
    }

    const enrolled = await Enrollment.exists({
        studentId: request.user.userId,
        courseId: quiz.courseId,
        status: { $in: ["active", "completed"] },
    })
    if (!enrolled) {
        response.status(403).json({ message: "You must be enrolled in this course to take its quizzes" })
        return null
    }
    return quiz
}

// The result + review a student sees after submitting (and when reopening it later)
function formatAttemptForStudent(attempt, quizTitle) {
    return {
        _id: attempt._id,
        quizId: attempt.quizId,
        courseId: attempt.courseId,
        quizTitle,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        scorePercent: attempt.scorePercent,
        passingScore: attempt.passingScore,
        passed: attempt.passed,
        answers: attempt.answers,
        submittedAt: attempt.createdAt,
    }
}

// Keep only the fields we accept, so extra client fields never reach the database
function pickQuestions(questions) {
    return questions.map(({ text, options, correctIndex }) => ({ text, options, correctIndex }))
}

// --- handlers ---

// POST /api/v1/quizzes
// Creates a new quiz for the course. A course can have any number of quizzes.
const createQuiz = asyncHandler(async (request, response) => {
    const { courseId, title, passingScore, questions } = request.body

    const course = await findOwnedCourse(courseId, request, response)
    if (!course) return

    const quiz = await Quiz.create({
        courseId,
        title,
        passingScore,
        questions: pickQuestions(questions),
    })
    response.status(201).json(quiz)
})

// GET /api/v1/quizzes/course/:courseId
// Instructor view: every quiz in the course (newest first), with correct answers
// and how many students have attempted each one.
const getQuizzesByCourse = asyncHandler(async (request, response) => {
    const { courseId } = request.params

    const course = await findOwnedCourse(courseId, request, response)
    if (!course) return

    const quizzes = await Quiz.find({ courseId })
        .select("+questions.correctIndex")
        .sort({ createdAt: -1 })
        .lean()

    const studentCounts = await QuizAttempt.aggregate([
        { $match: { courseId: course._id } },
        { $group: { _id: "$quizId", students: { $addToSet: "$studentId" } } },
        { $project: { studentCount: { $size: "$students" } } },
    ])
    const countByQuiz = new Map(studentCounts.map((row) => [row._id.toString(), row.studentCount]))

    response.json(quizzes.map((quiz) => ({
        ...quiz,
        studentCount: countByQuiz.get(quiz._id.toString()) || 0,
    })))
})

// GET /api/v1/quizzes/:quizId
// Instructor view of one quiz, with correct answers (used by the edit page).
const getQuizById = asyncHandler(async (request, response) => {
    const quiz = await findOwnedQuiz(request.params.quizId, request, response)
    if (!quiz) return

    response.json(quiz)
})

// GET /api/v1/quizzes/:quizId/attempts
// Each student's latest attempt on this quiz, including their answers.
const getLatestAttempts = asyncHandler(async (request, response) => {
    const quiz = await findOwnedQuiz(request.params.quizId, request, response)
    if (!quiz) return

    const rows = await QuizAttempt.aggregate([
        { $match: { quizId: quiz._id } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$studentId", latest: { $first: "$$ROOT" }, attemptCount: { $sum: 1 } } },
        { $lookup: { from: User.collection.name, localField: "_id", foreignField: "_id", as: "student" } },
        { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
        { $sort: { "latest.createdAt": -1 } },
        {
            $project: {
                _id: "$latest._id",
                student: {
                    _id: "$_id",
                    name: "$student.name",
                    email: "$student.email",
                },
                attemptCount: 1,
                correctCount: "$latest.correctCount",
                totalQuestions: "$latest.totalQuestions",
                scorePercent: "$latest.scorePercent",
                passingScore: "$latest.passingScore",
                passed: "$latest.passed",
                answers: "$latest.answers",
                submittedAt: "$latest.createdAt",
            },
        },
    ])

    response.json(rows)
})

// PUT /api/v1/quizzes/:quizId
// Replaces the title, passing score and the whole question list.
const updateQuiz = asyncHandler(async (request, response) => {
    const { title, passingScore, questions } = request.body

    const quiz = await findOwnedQuiz(request.params.quizId, request, response, { lean: false })
    if (!quiz) return

    quiz.title = title
    if (passingScore !== undefined) quiz.passingScore = passingScore
    quiz.questions = pickQuestions(questions)

    await quiz.save()
    response.json(quiz)
})

// DELETE /api/v1/quizzes/:quizId
// Also removes every student attempt for the quiz.
const deleteQuiz = asyncHandler(async (request, response) => {
    const quiz = await findOwnedQuiz(request.params.quizId, request, response)
    if (!quiz) return

    await QuizAttempt.deleteMany({ quizId: quiz._id })
    await Quiz.findByIdAndDelete(quiz._id)
    response.json({ message: "Quiz deleted successfully" })
})

// --- student handlers ---

// GET /api/v1/quizzes/:quizId/take
// Enrolled student: the questions and options to answer. Correct answers are never sent.
const getQuizForStudent = asyncHandler(async (request, response) => {
    const quiz = await findQuizForStudent(request.params.quizId, request, response)
    if (!quiz) return

    response.json({
        _id: quiz._id,
        courseId: quiz.courseId,
        title: quiz.title,
        passingScore: quiz.passingScore,
        totalQuestions: quiz.questions.length,
        questions: quiz.questions.map(({ _id, text, options }) => ({ _id, text, options })),
    })
})

// POST /api/v1/quizzes/:quizId/attempts
// Enrolled student submits answers. The server grades them and saves the attempt;
// any score or "passed" sent by the client is ignored. Retakes are allowed.
const submitQuizAttempt = asyncHandler(async (request, response) => {
    const quiz = await findQuizForStudent(request.params.quizId, request, response, { withCorrectAnswers: true })
    if (!quiz) return

    let result
    try {
        result = gradeQuiz(quiz, request.body.answers)
    } catch (error) {
        if (error instanceof QuizGradingError) {
            return response.status(400).json({ errors: [{ field: error.field, message: error.message }] })
        }
        throw error
    }

    const attempt = await QuizAttempt.create({
        quizId: quiz._id,
        courseId: quiz.courseId,
        studentId: request.user.userId,
        ...result,
    })

    response.status(201).json(formatAttemptForStudent(attempt, quiz.title))
})

// GET /api/v1/quizzes/:quizId/attempts/:attemptId
// A student's own attempt: score, pass/fail and each question with the right answer.
// Someone else's attempt answers 404, so attempt ids can't be probed.
const getAttemptForStudent = asyncHandler(async (request, response) => {
    const { quizId, attemptId } = request.params

    const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        quizId,
        studentId: request.user.userId,
    }).lean()
    if (!attempt) {
        return response.status(404).json({ message: "Attempt not found" })
    }

    const quiz = await Quiz.findById(quizId).select("title").lean()
    response.json(formatAttemptForStudent(attempt, quiz ? quiz.title : null))
})

module.exports = {
    createQuiz,
    getQuizzesByCourse,
    getQuizById,
    getLatestAttempts,
    updateQuiz,
    deleteQuiz,
    getQuizForStudent,
    submitQuizAttempt,
    getAttemptForStudent,
    quizIdValidator,
    courseIdParamValidator,
    createQuizValidators,
    updateQuizValidators,
    submitAttemptValidators,
    attemptParamsValidator,
}
