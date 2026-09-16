const express = require("express")
const router = express.Router()
const quizController = require("../controllers/quiz-controller")
const authMiddleware = require("../middlewares/auth-middleware")
const rbacMiddleware = require("../middlewares/rbac-middleware")
const validateRequest = require("../middlewares/validateRequest")
// quiz-routes (mounted at /api/v1/quizzes)

const instructorOnly = rbacMiddleware("instructor", "admin")
const studentOnly = rbacMiddleware("student")

// Every quiz route needs a logged-in user; each route then checks the role
router.use(authMiddleware)

// --- instructor: manage quizzes and see results ---

router.route("/")
    .post(instructorOnly, quizController.createQuizValidators, validateRequest, quizController.createQuiz)

router.route("/course/:courseId")
    .get(instructorOnly, quizController.courseIdParamValidator, validateRequest, quizController.getQuizzesByCourse)

router.route("/:quizId")
    .get(instructorOnly, quizController.quizIdValidator, validateRequest, quizController.getQuizById)
    .put(instructorOnly, quizController.updateQuizValidators, validateRequest, quizController.updateQuiz)
    .delete(instructorOnly, quizController.quizIdValidator, validateRequest, quizController.deleteQuiz)

// --- student (must be enrolled in the quiz's course): take a quiz and see results ---

router.route("/:quizId/take")
    .get(studentOnly, quizController.quizIdValidator, validateRequest, quizController.getQuizForStudent)

router.route("/:quizId/attempts")
    .get(instructorOnly, quizController.quizIdValidator, validateRequest, quizController.getLatestAttempts)
    .post(studentOnly, quizController.submitAttemptValidators, validateRequest, quizController.submitQuizAttempt)

router.route("/:quizId/attempts/:attemptId")
    .get(studentOnly, quizController.attemptParamsValidator, validateRequest, quizController.getAttemptForStudent)

module.exports = router
