export interface Lesson {
    _id: string
    courseId: string
    title: string
    contentUrl: string
    duration: number
    orderIndex: number
}

export interface Course {
    _id: string
    title: string
    description: string
    thumbnail: string
    category: string
    instructorId: string
    price: number
    isPublished: boolean
    createdAt: string
}

export interface CourseWithLessons extends Course {
    lessons: Lesson[]
}