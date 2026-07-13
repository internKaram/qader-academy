const mongoose = require("mongoose")

const lessonSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    contentUrl: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    orderIndex: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("Lesson", lessonSchema)