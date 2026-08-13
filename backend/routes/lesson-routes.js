const express = require('express');
const router = express.Router({ mergeParams: true });
const lessonController = require('../controllers/lesson-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const rbacMiddleware = require('../middlewares/rbac-middleware');
//lesson-routes
router
  .route('/')
  .post(
    authMiddleware,
    rbacMiddleware('instructor', 'admin'),
    lessonController.createLessonValidators,
    lessonController.createNewLesson
  )


router.route("/reorder")
    .patch(
      authMiddleware,
      rbacMiddleware("instructor", "admin"),
      lessonController.reorderLessonsValidators,
      lessonController.reorderLessons
    )

router.route("/:lessonId")
    .patch(
      authMiddleware,
      rbacMiddleware("instructor", "admin"),
      lessonController.updateLessonValidators,
      lessonController.updateLesson
    )
    .delete(
      authMiddleware,
      rbacMiddleware("instructor", "admin"),
      lessonController.lessonParamsValidators,
      lessonController.deleteLesson
    )
module.exports = router;