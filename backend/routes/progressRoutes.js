
const express = require('express');
const router = express.Router();
 
const { markLessonComplete, getProgress, getCompletionStatus } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
 
router.post('/', protect, markLessonComplete);
router.get('/:courseId', protect, getProgress);
router.get('/:courseId/completion-status', protect, getCompletionStatus);
 
module.exports = router;
 