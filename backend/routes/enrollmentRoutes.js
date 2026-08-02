const express = require('express');
const router = express.Router();
const { enrollInCourse, getStudentEnrollments } = require('../controllers/enrollmentController');
const authMiddleware = require('../middlewares/auth-middleware');
const rbacMiddleware = require('../middlewares/rbac-middleware');

router
  .route('/')
  .post(authMiddleware, rbacMiddleware('student'), enrollInCourse)       // POST /api/v1/enrollments
  .get(authMiddleware, rbacMiddleware('student'), getStudentEnrollments); // GET  /api/v1/enrollments

module.exports = router;

