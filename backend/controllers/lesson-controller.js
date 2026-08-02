const Lesson = require("../models/Lesson")
const Course = require("../models/Course")
const asyncHandler = require("express-async-handler")

const getAllLessons = asyncHandler( async (request, response)=> {



}) 

const createNewLesson = asyncHandler(async (request, response) => {
    const { courseId } = request.params
    const {title, contentUrl, duration, orderIndex} = request.body
    if(!title || !contentUrl || !duration || !orderIndex){
        return response.status(400).json({message: "Please fill all required fields"})
    }

    const course = await Course.findById(courseId)
    if (!course) {
        return response.status(404).json({ message: "Course not found" })
    }
    if (course.instructorId.toString() !== request.user.userId) {
        return response.status(403).json({ message: "Not authorized to add lessons to this course" })
    }

    const duplicate = await Lesson.findOne({title}).lean().exec()
    if(duplicate){
        return response.status(409).json({message: "Title already exists"})
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
    const { courseId } = request.params
    const { lessons } = request.body // expects [{ lessonId, orderIndex }, ...]

    const course = await Course.findById(courseId)
    if (!course) {
        return response.status(404).json({ message: "Course does not exist" })
    }
    if (course.instructorId.toString() !== request.user.userId) {
        return response.status(403).json({ message: "Unauthorized to reorder lessons on this course" })
    }

    if (!Array.isArray(lessons) || lessons.length === 0) {
        return response.status(400).json({ message: "lessons array is required" })
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
    getAllLessons,
    createNewLesson,
    updateLesson,
    deleteLesson,
    reorderLessons
}