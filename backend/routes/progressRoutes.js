const express = require('express');
const router = express.Router();
const { markLessonComplete, getProgress } = require('../controllers/progressController');
const authMiddleware = require('../middlewares/auth-middleware');
const rbacMiddleware = require('../middlewares/rbac-middleware');

router
  .route('/')
  .post(authMiddleware, rbacMiddleware('student'), markLessonComplete) // POST /api/v1/progress
  .get(authMiddleware, rbacMiddleware('student'), getProgress);         // GET  /api/v1/progress?enrollmentId=...

module.exports = router;