const express = require("express")
const router = express.Router()
const lessonRouter = require("./lesson-routes")
router.use("/:courseId/lessons", lessonRouter)

const courseController = require("../controllers/course-controller")

const authMiddleware = require("../middlewares/auth-middleware")
const rbacMiddleware = require("../middlewares/rbac-middleware")

router.route("/")
    .get(courseController.getAllCourses)
    .post(authMiddleware, rbacMiddleware("instructor", "admin"), courseController.createNewCourse)    
    .patch(courseController.updateCourse)
    .delete(courseController.deleteCourse)

module.exports = router