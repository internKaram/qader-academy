const express = require('express');
const router = express.Router();
const { markLessonComplete, getProgress } = require('../controllers/progressController');
 
router
  .route('/')
  .post(markLessonComplete) // POST /api/v1/progress
  .get(getProgress); // GET /api/v1/progress?enrollmentId=...
 
module.exports = router;