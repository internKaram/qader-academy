
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
 

const calculateCompletionPercentage = async (courseId, completedCount) => {
  const Lesson = mongoose.model('Lesson');
  const totalLessons = await Lesson.countDocuments({ course: courseId });
  if (totalLessons === 0) return 0;
  return Math.round((completedCount / totalLessons) * 100);
};
 
// @route   POST /api/v1/progress
// @body    { courseId, lessonId }
// @access  Private (student)
const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId) {
      return res.status(400).json({ message: 'courseId and lessonId are required' });
    }
 
    const studentId = req.user._id;
 
    let progress = await Progress.findOne({ student: studentId, course: courseId });
    if (!progress) {
      progress = await Progress.create({
        student: studentId,
        course: courseId,
        completedLessons: [],
      });
    }
 
    const alreadyCompleted = progress.completedLessons.some(
      (entry) => entry.lesson.toString() === lessonId
    );
 
    if (!alreadyCompleted) {
      progress.completedLessons.push({ lesson: lessonId, completedAt: new Date() });
      await progress.save();
    }
 
    const completionPercentage = await calculateCompletionPercentage(
      courseId,
      progress.completedLessons.length
    );
 
    return res.status(200).json({
      courseId,
      completedLessons: progress.completedLessons,
      completionPercentage,
      alreadyCompleted, // lets the frontend skip a redundant "lesson complete" toast
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating progress', error: error.message });
  }
};
 
// @route   GET /api/v1/progress/:courseId
// @access  Private (student)
const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;
 
    const progress = await Progress.findOne({ student: studentId, course: courseId });
    const completedLessons = progress ? progress.completedLessons : [];
 
    const completionPercentage = await calculateCompletionPercentage(
      courseId,
      completedLessons.length
    );
 
    return res.status(200).json({
      courseId,
      completedLessons,
      completionPercentage,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching progress', error: error.message });
  }
};
 

const getCompletionStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.query.student;
 
    if (!studentId) {
      return res.status(400).json({ message: 'student query param is required' });
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
 
module.exports = { markLessonComplete, getProgress, getCompletionStatus };