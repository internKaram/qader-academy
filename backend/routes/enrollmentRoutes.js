const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { enrollInCourse, getStudentEnrollments } = require('../controllers/enrollmentController');
const authMiddleware = require('../middlewares/auth-middleware');
const validateRequest = require('../middlewares/validateRequest');

const enrollValidators = [
  body('courseId').isMongoId().withMessage('courseId must be a valid id'),
];

router.post('/', authMiddleware, enrollValidators, validateRequest, enrollInCourse);
router.get('/', authMiddleware, getStudentEnrollments);

module.exports = router;
 