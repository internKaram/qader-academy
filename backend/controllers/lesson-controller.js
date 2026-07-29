const Lesson = require("../models/Lesson")
const Course = require("../models/Course")
const asyncHandler = require("express-async-handler")

const getAllLessons = asyncHandler(async (request, response) => {
    
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


const updateLesson = asyncHandler(async (request, response) => { // later


})

const deleteLesson = asyncHandler(async (request, response) => { // later


})

module.exports = 
{
    getAllLessons,
    createNewLesson,
    updateLesson,
    deleteLesson
}