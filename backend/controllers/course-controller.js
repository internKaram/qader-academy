const Course = require("../models/Course")
const Lesson = require("../models/Lesson")
const asyncHandler = require("express-async-handler")

// public GET
const getAllCourses = asyncHandler(async (request, response) => {
        const courses = await Course.find().lean() 
        if(!courses){
            return response.status(400).json({message: "No courses found"})
        }
        response.json(courses)
})

const getSpecificCourse = asyncHandler(async (request, response) => {
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
    console.log(request.user)
    console.log(request.instructorId)
    const {title, description, category, price} = request.body
    if(!title || !description || !category || !price){
        return response.status(400).json({message: "Please fill all required fields"})
    }

    const duplicate = await Course.findOne({title}).lean().exec()
    if(duplicate){
        return response.status(409).json({message: "Title already exists"})
    }

    const courseObject = {title, description, category, price, instructorId: request.user.userId}

    const course = await Course.create(courseObject)
    if(course){
        response.status(201).json({message: `Course ${title} created successfuly`})
    }else{
        response.status(400).json({message: "Invalid course data received"})
    }
})


const updateCourse = asyncHandler(async (request, response) => { // later


})

const deleteCourse = asyncHandler(async (request, response) => { // later


})

module.exports = 
{
    getAllCourses,
    getSpecificCourse,
    createNewCourse,
    updateCourse,
    deleteCourse
}