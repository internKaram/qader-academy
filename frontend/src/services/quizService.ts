import api from "../api/axios"
import type {
    AvailableQuiz, CourseStudentsReport, LatestQuizAttempt, Quiz, QuizInput, QuizSubmission, QuizWithStats,
    StudentQuiz, StudentQuizAttempt,
} from "../types/quiz"

// --- instructor views (they include correct answers) ---

export async function listQuizzesForCourse(courseId: string): Promise<QuizWithStats[]> {
    const response = await api.get<QuizWithStats[]>(`/quizzes/course/${courseId}`)
    return response.data
}

export async function getQuiz(quizId: string): Promise<Quiz> {
    const response = await api.get<Quiz>(`/quizzes/${quizId}`)
    return response.data
}

export async function createQuiz(courseId: string, input: QuizInput): Promise<Quiz> {
    const response = await api.post<Quiz>("/quizzes", { courseId, ...input })
    return response.data
}

export async function updateQuiz(quizId: string, input: QuizInput): Promise<Quiz> {
    const response = await api.put<Quiz>(`/quizzes/${quizId}`, input)
    return response.data
}

export async function deleteQuiz(quizId: string): Promise<void> {
    await api.delete(`/quizzes/${quizId}`)
}

// Each student's latest attempt on the quiz, with their answers
export async function getLatestAttempts(quizId: string): Promise<LatestQuizAttempt[]> {
    const response = await api.get<LatestQuizAttempt[]>(`/quizzes/${quizId}/attempts`)
    return response.data
}

// Every student enrolled in the course, with their latest grade on each quiz
export async function getCourseStudents(courseId: string): Promise<CourseStudentsReport> {
    const response = await api.get<CourseStudentsReport>(`/quizzes/course/${courseId}/students`)
    return response.data
}

// --- student views (enrolled students only; correct answers only come back after submitting) ---

// The course's quizzes with the student's latest attempt on each
export async function listAvailableQuizzes(courseId: string): Promise<AvailableQuiz[]> {
    const response = await api.get<AvailableQuiz[]>(`/quizzes/course/${courseId}/available`)
    return response.data
}

export async function getQuizToTake(quizId: string): Promise<StudentQuiz> {
    const response = await api.get<StudentQuiz>(`/quizzes/${quizId}/take`)
    return response.data
}

// The server grades the answers and returns the result with the review
export async function submitQuizAttempt(quizId: string, submission: QuizSubmission): Promise<StudentQuizAttempt> {
    const response = await api.post<StudentQuizAttempt>(`/quizzes/${quizId}/attempts`, submission)
    return response.data
}

export async function getMyAttempt(quizId: string, attemptId: string): Promise<StudentQuizAttempt> {
    const response = await api.get<StudentQuizAttempt>(`/quizzes/${quizId}/attempts/${attemptId}`)
    return response.data
}
