const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson'); // owned by Karam (CRS epic)
const { checkAndTriggerCertificate } = require('../services/certificateService');
 

exports.markLessonComplete = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, lessonId } = req.body;
 
    let progress = await Progress.findOne({ student: studentId, course: courseId });
    if (!progress) {
      progress = await Progress.create({ student: studentId, course: courseId });
    }
 
    const alreadyDone = progress.completedLessons.some(
      (entry) => entry.lesson.toString() === lessonId
    );
    if (!alreadyDone) {
      progress.completedLessons.push({ lesson: lessonId });
    }
    progress.lastAccessedAt = new Date();
 
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    progress.completionPercentage = totalLessons
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;
 
    await progress.save();
 
    // Never let a certificate-service hiccup fail the student's request —
    // checkAndTriggerCertificate already handles its own idempotency via
    // the unique index on Certificate{student, course}.
    try {
      const result = await checkAndTriggerCertificate({
        studentId,
        courseId,
        quizPassed: progress.quizPassed,
      });
      if (result.triggered && result.isNewlyIssued) {
        progress.certificateIssued = true;
        await progress.save();
      }
    } catch (certErr) {
      console.error('Certificate trigger failed (non-fatal):', certErr.message);
    }
 
    return res.status(200).json({ progress });
  } catch (err) {
    console.error('markLessonComplete error:', err);
    return res.status(500).json({ message: 'Server error while updating progress' });
  }
};
 
/**
 * GET /api/v1/progress/:courseId
 * Returns the logged-in student's progress for a single course.
 */
exports.getCourseProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;
 
    const progress = await Progress.findOne({ student: studentId, course: courseId });
    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this course' });
    }
 
    return res.status(200).json({ progress });
  } catch (err) {
    console.error('getCourseProgress error:', err);
    return res.status(500).json({ message: 'Server error while fetching progress' });
  }
};
 
/**
 * GET /api/v1/progress
 * Returns progress across all of the logged-in student's enrolled courses
 * (used by the dashboard to render per-course progress bars).
 */
exports.getAllProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const progress = await Progress.find({ student: studentId }).populate(
      'course',
      'title thumbnail'
    );
    return res.status(200).json({ progress });
  } catch (err) {
    console.error('getAllProgress error:', err);
    return res.status(500).json({ message: 'Server error while fetching progress' });
    const { courseId } = req.params;
    const queryStudentId = req.query.student;
    const studentId = (req.user && req.user.role === 'admin' && queryStudentId)
      ? queryStudentId
      : (req.user?._id || req.user?.userId || queryStudentId);

    if (!studentId) {
      return res.status(400).json({ message: 'student query param or authentication is required' });
    }

    const Lesson = mongoose.model('Lesson'); 
    const [totalLessons, progress] = await Promise.all([
      Lesson.countDocuments({ course: courseId }),
      Progress.findOne({ student: studentId, course: courseId }),
    ]);

    const completedCount = progress ? progress.completedLessons.length : 0;
    const allLessonsComplete = totalLessons > 0 && completedCount >= totalLessons;

    return res.status(200).json({ allLessonsComplete, completedCount, totalLessons });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error checking completion status', error: error.message });
  }
};
 