const express = require('express');
const router = express.Router();

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
