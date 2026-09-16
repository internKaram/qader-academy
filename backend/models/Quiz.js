const mongoose = require("mongoose")

// Questions live inside the quiz document (no separate collection).
const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [{ type: String, required: true, trim: true }],
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length === 4,
            message: "A question must have exactly 4 options"
        }
    },
    // Hidden from query results by default so it never reaches students.
    // Load it only for grading: Quiz.findById(id).select("+questions.correctIndex")
    correctIndex: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
        select: false
    }
})

const quizSchema = new mongoose.Schema({
    // One quiz per course
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    // Percentage (0-100) of correct answers needed to pass
    passingScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length > 0,
            message: "A quiz must have at least 1 question"
        }
    }
}, { timestamps: true })

module.exports = mongoose.model("Quiz", quizSchema)
