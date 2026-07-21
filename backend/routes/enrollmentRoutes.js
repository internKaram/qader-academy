const express = require('express');
const router = express.Router();
const { enrollInCourse, getStudentEnrollments } = require('../controllers/enrollmentController');


router.route('/')
  .post(enrollInCourse)       // POST /api/v1/enrollments
  .get(getStudentEnrollments); // GET /api/v1/enrollments

module.exports = router;
