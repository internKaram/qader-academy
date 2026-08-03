const mongoose = require('mongoose');
 
const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedLessons: [
      {
        lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    quizPassed: {
      type: Boolean,
      default: false,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
 
// One progress document per student/course pair
progressSchema.index({ student: 1, course: 1 }, { unique: true });
 
module.exports = mongoose.model('Progress', progressSchema);