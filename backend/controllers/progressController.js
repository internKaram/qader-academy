const Progress = require('../models/Progress');
 

exports.markLessonComplete = async (req, res) => {
  try {
    const { enrollmentId, lessonId } = req.body;
 
    if (!enrollmentId || !lessonId) {
      return res.status(400).json({ message: 'missingEnrollmentIdOrLessonId' });
    }
 
    // upsert: calling this twice for the same lesson updates the same
    // record instead of creating a duplicate (idempotent by design)
    const progress = await Progress.findOneAndUpdate(
      { enrollmentId, lessonId },
      { percent: 100, lastAccessed: Date.now() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
 
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'error server', error: error.message });
  }
};
 
// @route  GET /api/v1/progress?enrollmentId=...
// @desc   Get all completed-lesson records for one enrollment
// @access Private
exports.getProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.query;
 
    if (!enrollmentId) {
      return res.status(400).json({ message: 'missingEnrollmentId' });
    }
 
    const progress = await Progress.find({ enrollmentId });
 
    res.status(200).json({
      count: progress.length,
      progress,
    });
  } catch (error) {
    res.status(500).json({ message: 'error server', error: error.message });
  }
};