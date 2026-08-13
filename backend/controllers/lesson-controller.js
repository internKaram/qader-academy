const Lesson = require("../models/Lesson")
const Course = require("../models/Course")
const asyncHandler = require("express-async-handler")
const { body, param, validationResult } = require("express-validator")

// --- validators ---

const lessonParamsValidators = [
    param("courseId").isMongoId().withMessage("Invalid course id"),
    param("lessonId").isMongoId().withMessage("Invalid lesson id"),
]

const createLessonValidators = [
    param("courseId").isMongoId().withMessage("Invalid course id"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("contentUrl").trim().notEmpty().withMessage("Content URL is required")
        .bail().isURL().withMessage("Content URL must be a valid URL"),
    body("duration")
        .exists({ checkFalsy: false }).withMessage("Duration is required")
        .bail().isFloat({ min: 0 }).withMessage("Duration must be a positive number"),
    body("orderIndex")
        .exists({ checkFalsy: false }).withMessage("Order index is required")
        .bail().isInt({ min: 0 }).withMessage("Order index must be a non-negative integer"),
]

const updateLessonValidators = [
    param("courseId").isMongoId().withMessage("Invalid course id"),
    param("lessonId").isMongoId().withMessage("Invalid lesson id"),
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("contentUrl").optional().trim().isURL().withMessage("Content URL must be a valid URL"),
    body("duration").optional().isFloat({ min: 0 }).withMessage("Duration must be a positive number"),
    body("orderIndex").optional().isInt({ min: 0 }).withMessage("Order index must be a non-negative integer"),
]

const reorderLessonsValidators = [
    param("courseId").isMongoId().withMessage("Invalid course id"),
    body("lessons").isArray({ min: 1 }).withMessage("lessons array is required"),
    body("lessons.*.lessonId").isMongoId().withMessage("Each lesson must have a valid lessonId"),
    body("lessons.*.orderIndex").isInt({ min: 0 }).withMessage("Each lesson must have a valid orderIndex"),
]

function sendValidationErrors(request, response) {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        response.status(400).json({
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        })
        return true
    }
    return false
}

const createNewLesson = asyncHandler(async (request, response) => {
    if (sendValidationErrors(request, response)) return

    const { courseId } = request.params
    const {title, contentUrl, duration, orderIndex} = request.body

    const course = await Course.findById(courseId)
    if (!course) {
        return response.status(404).json({ message: "Course not found" })
    }
    if (course.instructorId.toString() !== request.user.userId) {
        return response.status(403).json({ message: "Not authorized to add lessons to this course" })
    }

    // Scoped to this course only — "Lesson 1" is a totally reasonable title
    // to reuse across different courses, just not twice within the same one
    const duplicate = await Lesson.findOne({ title, courseId }).lean().exec()
    if (duplicate) {
        return response.status(409).json({ message: "This course already has a lesson with this title" })
    }


    const lessonObject = { title, contentUrl, duration, orderIndex, courseId }

    const lesson = await Lesson.create(lessonObject)


    if(lesson){
        response.status(201).json({message: `Lesson ${title} created successfuly`})
    }else{
        response.status(400).json({message: "Invalid lesson data received"})
    }
})


const updateLesson = asyncHandler(async (request, response) => {
    if (sendValidationErrors(request, response)) return

    const { courseId, lessonId } = request.params
    const { title, contentUrl, duration, orderIndex } = request.body

    const course = await Course.findById(courseId)
    if (!course) {
        return response.status(404).json({ message: "Course does not exist" })
    }
    if (course.instructorId.toString() !== request.user.userId) {
        return response.status(403).json({ message: "Unauthorized to update lessons on this course" })
    }

    const lesson = await Lesson.findById(lessonId)
    if (!lesson || lesson.courseId.toString() !== courseId) {
        return response.status(404).json({ message: "Lesson not found in this course" })
    }

    const updates = {}
    if (title !== undefined) updates.title = title
    if (contentUrl !== undefined) updates.contentUrl = contentUrl
    if (duration !== undefined) updates.duration = duration
    if (orderIndex !== undefined) updates.orderIndex = orderIndex

    const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, updates, { new: true, runValidators: true })

    response.json(updatedLesson)
})


const deleteLesson = asyncHandler(async (request, response) => {
    if (sendValidationErrors(request, response)) return

    const { courseId, lessonId } = request.params

    const course = await Course.findById(courseId)
    if (!course) {
        return response.status(404).json({ message: "Course does not exist" })
    }
    if (course.instructorId.toString() !== request.user.userId) {
        return response.status(403).json({ message: "Unauthorized to delete lessons on this course" })
    }

    const lesson = await Lesson.findById(lessonId)
    if (!lesson || lesson.courseId.toString() !== courseId) {
        return response.status(404).json({ message: "Lesson not found in this course" })
    }

    await Lesson.findByIdAndDelete(lessonId)

    response.json({ message: "Lesson deleted successfully" })
})


const reorderLessons = asyncHandler(async (request, response) => {
    if (sendValidationErrors(request, response)) return

    const { courseId } = request.params
    const { lessons } = request.body // expects [{ lessonId, orderIndex }, ...]

    const course = await Course.findById(courseId)
    if (!course) {
        return response.status(404).json({ message: "Course does not exist" })
    }
    if (course.instructorId.toString() !== request.user.userId) {
        return response.status(403).json({ message: "Unauthorized to reorder lessons on this course" })
    }

    const updateOperations = lessons.map(({ lessonId, orderIndex }) => ({
        updateOne: {
            filter: { _id: lessonId, courseId },
            update: { orderIndex }
        }
    }))

    await Lesson.bulkWrite(updateOperations)

    const updatedLessons = await Lesson.find({ courseId }).sort({ orderIndex: 1 }).lean()
    response.json(updatedLessons)
})


module.exports =
{
    createNewLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    lessonParamsValidators,
    createLessonValidators,
    updateLessonValidators,
    reorderLessonsValidators,
}