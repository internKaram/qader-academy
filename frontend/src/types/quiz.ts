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
