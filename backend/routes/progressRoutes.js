const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  markLessonComplete,
  getCourseProgress,
  getAllProgress,
  getCompletionStatus,
} = require('../controllers/progressController');
const authMiddleware = require('../middlewares/auth-middleware');
const validateRequest = require('../middlewares/validateRequest');

const markCompleteValidators = [
  body('courseId').isMongoId().withMessage('courseId must be a valid id'),
  body('lessonId').isMongoId().withMessage('lessonId must be a valid id'),
];

const courseIdParamValidator = [
  param('courseId').isMongoId().withMessage('courseId must be a valid id'),
];

router.post('/', authMiddleware, markCompleteValidators, validateRequest, markLessonComplete);
router.get('/', authMiddleware, getAllProgress);
router.get('/:courseId/completion-status', authMiddleware, courseIdParamValidator, validateRequest, getCompletionStatus);
router.get('/:courseId', authMiddleware, courseIdParamValidator, validateRequest, getCourseProgress);

module.exports = router;
 