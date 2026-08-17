const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { enrollInCourse, getMyEnrollments } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware'); // owned by Faisal (AUTH epic)
const validateRequest = require('../middleware/validateRequest');
 
const enrollValidators = [
  body('courseId').isMongoId().withMessage('courseId must be a valid id'),
];
 
router.post('/', protect, enrollValidators, validateRequest, enrollInCourse);
router.get('/', protect, getMyEnrollments);
 
module.exports = router;
 