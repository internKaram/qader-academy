const Course = require("../models/Course")
const Lesson = require("../models/Lesson")
const asyncHandler = require("express-async-handler")
const mongoose = require('mongoose');
const { body, param, query, validationResult } = require("express-validator")

// --- validators ---

const courseIdValidator = [
    param("courseId").isMongoId().withMessage("Invalid course id"),
]

const paginationValidators = [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
]

const createCourseValidators = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("price")
        .exists({ checkFalsy: false }).withMessage("Price is required")
        .bail()
        .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("thumbnail").optional({ checkFalsy: true }).isURL().withMessage("Thumbnail must be a valid URL"),
    body("isPublished").optional().isBoolean().withMessage("isPublished must be true or false"),
]

const updateCourseValidators = [
    param("courseId").isMongoId().withMessage("Invalid course id"),
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
    body("category").optional().trim().notEmpty().withMessage("Category cannot be empty"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("thumbnail").optional({ checkFalsy: true }).isURL().withMessage("Thumbnail must be a valid URL"),
    body("isPublished").optional().isBoolean().withMessage("isPublished must be true or false"),
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

// public GET — paginated
const getAllCourses = asyncHandler(async (request, response) => {
        if (sendValidationErrors(request, response)) return

        const page = parseInt(request.query.page) || 1
        const limit = parseInt(request.query.limit) || 12
        const skip = (page - 1) * limit

        const filter = { isPublished: true } // only displays published courses, no drafts

        const [courses, totalItems] = await Promise.all([
            Course.find(filter).skip(skip).limit(limit).lean(),
            Course.countDocuments(filter),
        ])

        response.json({
            courses,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                pageSize: limit,
            },
        })
})

const getMyCourses = asyncHandler(async (request, response) => {
        const courses = await Course.find({ instructorId: request.user.userId }).lean()
        if(!courses){
            return response.status(400).json({message: "No courses found"})
        }
        response.json(courses)
})

const getSpecificCourse = asyncHandler(async (request, response) => {
        if (sendValidationErrors(request, response)) return

        const { courseId } = request.params
        const course = await Course.findById(courseId).lean()
        if(!course){
            return response.status(404).json({message: "No course found"})
        }

        const lessons = await Lesson.find({ courseId }).sort({ orderIndex: 1 }).lean()

        response.json({...course ,lessons})
})


// instructor POST
const createNewCourse = asyncHandler(async (request, response) => {
    if (sendValidationErrors(request, response)) return


    const {title, description, category, price, thumbnail, isPublished} = request.body

    // Scoped to this instructor only — two different instructors can use the same
    // course title; we're just preventing one instructor from duplicating their own
    const duplicate = await Course.findOne({ title, instructorId: request.user.userId }).lean().exec()
    if (duplicate) {
        return response.status(409).json({ message: "You already have a course with this title" })
    }
    const courseObject = {title, description, category, price, instructorId: request.user.userId, thumbnail, isPublished: Boolean(isPublished)}

    const course = await Course.create(courseObject)
    if(course){
        response.status(201).json({message: `Course ${title} created successfuly`})
    }else{
        response.status(400).json({message: "Invalid course data received"})
    }
})


const updateCourse = asyncHandler(async (request, response) => {
    if (sendValidationErrors(request, response)) return

    const {title, description, category, price, thumbnail, isPublished} = request.body
    const {courseId} = request.params
    const wantedCourse = await Course.findById(courseId)

    if(!wantedCourse){
        return response.status(404).json({message: "Course does not exist"})
    }

    if (wantedCourse.instructorId.toString() !== request.user.userId) {
        return response.status(403).json({message: "Unauthorized to update this course"})
    }

    const updates = {}
        if (title !== undefined) updates.title = title
        if (description !== undefined) updates.description = description
        if (category !== undefined) updates.category = category
        if (price !== undefined) updates.price = price
        if (thumbnail !== undefined) updates.thumbnail = thumbnail
        if (isPublished !== undefined) updates.isPublished = isPublished

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updates, { new: true, runValidators: true })

    response.json(updatedCourse)


})

const deleteCourse = asyncHandler(async (request, response) => {
    if (sendValidationErrors(request, response)) return

    const { courseId } = request.params
    const wantedCourse = await Course.findById(courseId)

    if (!wantedCourse) {
        return response.status(404).json({ message: "Course does not exist" })
    }

    if (wantedCourse.instructorId.toString() !== request.user.userId) {
        return response.status(403).json({ message: "Unauthorized to delete this course" })
    }

    await Lesson.deleteMany({ courseId }) // removes lessons belonging to this course
    await Course.findByIdAndDelete(courseId)

    response.json({ message: "Course and its lessons deleted successfully" })
})

module.exports =
{
    getAllCourses,
    getMyCourses,
    getSpecificCourse,
    createNewCourse,
    updateCourse,
    deleteCourse,
    courseIdValidator,
    paginationValidators,
    createCourseValidators,
    updateCourseValidators,
}