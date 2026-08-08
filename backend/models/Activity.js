const mongoose = require('mongoose');
 
const ACTIVITY_TYPES = [
  'lesson_completed',
  'course_started',
  'quiz_passed',
  'quiz_failed',
  'certificate_issued',
];
 
const ActivitySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
 
    courseTitle: { type: String, required: true },
    lessonTitle: { type: String },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

ActivitySchema.index({ student: 1, createdAt: -1 });
 
module.exports = mongoose.model('Activity', ActivitySchema);
module.exports.ACTIVITY_TYPES = ACTIVITY_TYPES;
 