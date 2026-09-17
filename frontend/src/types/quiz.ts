export interface QuizQuestion {
    _id?: string
    text: string
    options: string[]
    correctIndex: number
}

export interface Quiz {
    _id: string
    courseId: string
    title: string
    passingScore: number
    questions: QuizQuestion[]
    createdAt: string
    updatedAt: string
}

// A quiz in the course list, with how many students have attempted it
export interface QuizWithStats extends Quiz {
    studentCount: number
}

// What the builder sends when saving (create adds courseId)
export interface QuizInput {
    title: string
    passingScore: number
    questions: QuizQuestion[]
}

export interface QuizAttemptAnswer {
    questionId?: string
    questionText: string
    options: string[]
    selectedIndex: number | null
    correctIndex: number
    isCorrect: boolean
}

// A student's most recent attempt on a quiz (instructor results view)
export interface LatestQuizAttempt {
    _id: string
    student: {
        _id: string
        name?: string
        email?: string
    }
    attemptCount: number
    correctCount: number
    totalQuestions: number
    scorePercent: number
    passingScore: number
    passed: boolean
    submittedAt: string
    answers: QuizAttemptAnswer[]
}

// --- student side ---

// A quiz as a student sees it before answering (no correct answers)
export interface StudentQuiz {
    _id: string
    courseId: string
    title: string
    passingScore: number
    totalQuestions: number
    questions: {
        _id: string
        text: string
        options: string[]
    }[]
}

// Short summary of someone's latest attempt on a quiz
export interface QuizAttemptSummary {
    attemptId: string
    correctCount: number
    totalQuestions: number
    scorePercent: number
    passingScore: number
    passed: boolean
    submittedAt: string
    attemptCount: number
}

// A quiz in the student's course page list
export interface AvailableQuiz {
    _id: string
    courseId: string
    title: string
    passingScore: number
    totalQuestions: number
    latestAttempt: QuizAttemptSummary | null
}

// What the student sends: one entry per answered question
export interface QuizSubmission {
    answers: { questionId: string; selectedIndex: number | null }[]
}

// A graded attempt with the review, as the student sees it
export interface StudentQuizAttempt {
    _id: string
    quizId: string
    courseId: string
    quizTitle: string | null
    correctCount: number
    totalQuestions: number
    scorePercent: number
    passingScore: number
    passed: boolean
    submittedAt: string
    answers: QuizAttemptAnswer[]
}

// --- instructor: enrolled students and their grades ---

export interface CourseStudentGrade extends QuizAttemptSummary {
    quizId: string
}

export interface CourseStudent {
    _id: string
    name: string
    email: string
    enrolledAt: string
    status: "active" | "completed" | "suspended"
    // Only quizzes the student has taken (latest attempt each)
    grades: CourseStudentGrade[]
}

export interface CourseStudentsReport {
    quizzes: { _id: string; title: string; passingScore: number; totalQuestions: number }[]
    students: CourseStudent[]
}
