const express = require("express")
const router = express.Router()
const quizController = require("../controllers/quiz-controller")
const authMiddleware = require("../middlewares/auth-middleware")
const rbacMiddleware = require("../middlewares/rbac-middleware")
const validateRequest = require("../middlewares/validateRequest")
// quiz-routes (mounted at /api/v1/quizzes)

router.use(authMiddleware, rbacMiddleware("instructor", "admin"))

router.route("/")
    .post(quizController.createQuizValidators, validateRequest, quizController.createQuiz)

router.route("/course/:courseId")
    .get(quizController.courseIdParamValidator, validateRequest, quizController.getQuizzesByCourse)

router.route("/:quizId")
    .get(quizController.quizIdValidator, validateRequest, quizController.getQuizById)
    .put(quizController.updateQuizValidators, validateRequest, quizController.updateQuiz)
    .delete(quizController.quizIdValidator, validateRequest, quizController.deleteQuiz)

router.route("/:quizId/attempts")
    .get(quizController.quizIdValidator, validateRequest, quizController.getLatestAttempts)

module.exports = router
