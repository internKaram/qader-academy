const express = require('express');
const router = express.Router();
 
const { markLessonComplete, getProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
 
router.post('/', protect, markLessonComplete);
router.get('/:courseId', protect, getProgress);
 
module.exports = router;
 