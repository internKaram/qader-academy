
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
 
module.exports = router;
 