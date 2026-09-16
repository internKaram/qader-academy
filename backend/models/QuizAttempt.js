const mongoose = require("mongoose")

// One answer inside an attempt. The question text, options and correct answer are
// copied in at submit time, so the attempt still makes sense if the instructor
// edits or deletes questions later.
const attemptAnswerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId
    },
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    // null when the student skipped the question
    selectedIndex: {
        type: Number,
        min: 0,
        max: 3,
        default: null
    },
    correctIndex: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
}, { _id: false })

// Every submission is stored; "latest attempt" is the newest createdAt per student.
const quizAttemptSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    answers: {
        type: [attemptAnswerSchema],
        default: []
    },
    correctCount: {
        type: Number,
        required: true,
        min: 0
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 0
    },
    // Percentage (0-100) the student scored
    scorePercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    // The quiz's passing score at the time of the attempt
    passingScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    passed: {
        type: Boolean,
        required: true
    }
}, { timestamps: true })

quizAttemptSchema.index({ quizId: 1, studentId: 1, createdAt: -1 })

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema)
