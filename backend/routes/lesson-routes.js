const express = require('express');
const router = express.Router({ mergeParams: true });
const lessonController = require('../controllers/lesson-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const rbacMiddleware = require('../middlewares/rbac-middleware');

router
  .route('/')
  .get(lessonController.getAllLessons)
  .post(authMiddleware, rbacMiddleware('instructor', 'admin'), lessonController.createNewLesson)
  .patch(authMiddleware, rbacMiddleware('instructor', 'admin'), lessonController.updateLesson)
  .delete(authMiddleware, rbacMiddleware('instructor', 'admin'), lessonController.deleteLesson);

module.exports = router;