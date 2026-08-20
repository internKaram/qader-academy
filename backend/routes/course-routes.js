const express = require('express');
const router = express.Router();
const lessonRouter = require('./lesson-routes');
router.use('/:courseId/lessons', lessonRouter);
// course-routes
const courseController = require('../controllers/course-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const rbacMiddleware = require('../middlewares/rbac-middleware');


router.route("/")
    .get(courseController.paginationValidators, courseController.getAllCourses)
    .post(
      authMiddleware,
      rbacMiddleware("instructor", "admin"),
      courseController.createCourseValidators,
      courseController.createNewCourse
    )


router.route("/mine")
    .get(authMiddleware, rbacMiddleware("instructor", "admin"), courseController.getMyCourses) // for instructor's own courses

router.route("/:courseId")
    .get(courseController.courseIdValidator, courseController.getSpecificCourse)
    .patch(
      authMiddleware,
      rbacMiddleware("instructor", "admin"),
      courseController.updateCourseValidators,
      courseController.updateCourse
    )
    .delete(
      authMiddleware,
      rbacMiddleware("instructor", "admin"),
      courseController.courseIdValidator,
      courseController.deleteCourse
    )
module.exports = router;