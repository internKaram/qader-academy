const Quiz = require("../models/Quiz")
const QuizAttempt = require("../models/QuizAttempt")
const Course = require("../models/Course")
const User = require("../models/User")
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

module.exports = {
    createQuiz,
    getQuizzesByCourse,
    getQuizById,
    getLatestAttempts,
    updateQuiz,
    deleteQuiz,
    quizIdValidator,
    courseIdParamValidator,
    createQuizValidators,
    updateQuizValidators,
}
