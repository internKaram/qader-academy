import api from "../api/axios"
import type { LatestQuizAttempt, Quiz, QuizInput, QuizWithStats } from "../types/quiz"

// All endpoints below are instructor views (they include correct answers).

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
