
const axios = require('axios');
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const { logActivity } = require('../controllers/activityController');
const {
  buildCertificateRequestBody,
  isLikelyDuplicateResponse,
} = require('../config/certificateContract');
 
const CERT_SERVICE_URL = process.env.CERT_SERVICE_URL || 'http://localhost:5000/api/v1/certificates';
 

const checkAndTriggerCertificate = async ({ studentId, courseId, quizPassed }) => {
  if (!quizPassed) return { triggered: false, reason: 'quiz not passed yet' };
 
  const Lesson = mongoose.model('Lesson');
  const Course = mongoose.model('Course');
 
  const [totalLessons, progress, course] = await Promise.all([
    Lesson.countDocuments({ course: courseId }),
    Progress.findOne({ student: studentId, course: courseId }),
    Course.findById(courseId).select('title'),
  ]);
 
  const completedCount = progress?.completedLessons?.length || 0;
  const allLessonsComplete = totalLessons > 0 && completedCount >= totalLessons;
 
  if (!allLessonsComplete) {
    return { triggered: false, reason: 'lessons incomplete', completedCount, totalLessons };
  }
 
  const requestBody = buildCertificateRequestBody({ studentId, courseId });
 
  try {
    const response = await axios.post(CERT_SERVICE_URL, requestBody, {
      headers: { Authorization: `Bearer ${process.env.SERVICE_TO_SERVICE_TOKEN}` },
      timeout: 5000,
      // 201 is the only documented success status — anything else (4xx/5xx)
      // falls into the catch block below, where we still have to figure out
      // whether it means "already exists" or "genuinely broken."
      validateStatus: (status) => status === 201,
    });
 
    // Confirmed contract: 201 means newly created. No ambiguity here.
    await logActivity({
      student: studentId,
      type: 'certificate_issued',
      course: courseId,
      courseTitle: course?.title || 'your course',
      meta: { certificateNumber: response.data?.certificateNumber },
    });
 
    return { triggered: true, isNewlyIssued: true, certificate: response.data };
  } catch (error) {

    if (isLikelyDuplicateResponse(error)) {
    
      return { triggered: true, isNewlyIssued: false, reason: 'already issued' };
    }
 
    console.error('Certificate trigger failed:', error.message, {
      status: error.response?.status,
      body: error.response?.data,
    });
    return { triggered: false, reason: 'certificate service error', error: error.message };
  }
};
 
module.exports = { checkAndTriggerCertificate };