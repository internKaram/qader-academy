const Enrollment = require('../models/Enrollment');

// @desc    create a new enrollment for a student in a course
// @route   POST /api/v1/enrollments
// @access  Private (test the authentication middleware)
exports.enrollInCourse = async (req, res) => {
  try {
    const { studentId: reqStudentId, courseId } = req.body;
    const studentId = (req.user && req.user.role === 'admin' && reqStudentId)
      ? reqStudentId
      : (req.user?.userId || req.user?._id || reqStudentId);

    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }

    const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'أنت مسجل بالفعل في هذا الكورس' });
    }

    // Create a new enrollment
    const newEnrollment = new Enrollment({
      studentId,
      courseId
    });

    await newEnrollment.save();

    res.status(201).json({
      message: 'enrollment successful',
      enrollment: newEnrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'error server', error: error.message });
  }
};

// @desc    get the list of courses a student is enrolled in 
// @route   GET /api/v1/enrollments
// @access  Private
exports.getStudentEnrollments = async (req, res) => {
  try {
    const queryStudentId = req.query.studentId;
    const studentId = (req.user && req.user.role === 'admin' && queryStudentId)
      ? queryStudentId
      : (req.user?.userId || req.user?._id || queryStudentId);

    if (!studentId) {
      return res.status(400).json({ message: 'missingstudentId' });
    }

    const enrollments = await Enrollment.find({ studentId }).populate('courseId');

    res.status(200).json({
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    res.status(500).json({ message: 'error server', error: error.message });
  }
};