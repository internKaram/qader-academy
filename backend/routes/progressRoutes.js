const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  markLessonComplete,
  getCourseProgress,
  getAllProgress,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
 
const markCompleteValidators = [
  body('courseId').isMongoId().withMessage('courseId must be a valid id'),
  body('lessonId').isMongoId().withMessage('lessonId must be a valid id'),
];
 
const courseIdParamValidator = [
  param('courseId').isMongoId().withMessage('courseId must be a valid id'),
];
 
router.post('/', protect, markCompleteValidators, validateRequest, markLessonComplete);
router.get('/', protect, getAllProgress);
router.get('/:courseId', protect, courseIdParamValidator, validateRequest, getCourseProgress);
 

// Controllers
const {
  markLessonComplete,
  getProgress,
  getCompletionStatus
} = require('../controllers/progressController');

// New unified middlewares (replace protect everywhere)
const authMiddleware = require('../middlewares/auth-middleware');
const rbacMiddleware = require('../middlewares/rbac-middleware');

// POST /api/v1/progress
router.post(
  '/',
  authMiddleware,
  rbacMiddleware('student'),
  markLessonComplete
);

// GET /api/v1/progress/:courseId
router.get(
  '/:courseId',
  authMiddleware,
  rbacMiddleware('student'),
  getProgress
);

// GET /api/v1/progress/:courseId/completion-status
router.get(
  '/:courseId/completion-status',
  authMiddleware,
  rbacMiddleware('student'),
  getCompletionStatus
);

module.exports = router;
 