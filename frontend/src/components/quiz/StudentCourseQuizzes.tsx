import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ListChecks, RotateCcw } from "lucide-react"
import { Spinner } from "../ui"
import { listAvailableQuizzes } from "../../services/quizService"
import type { AvailableQuiz } from "../../types/quiz"
import {
    outlineButtonClass, pillBrandClass, pillDangerClass, pillNeutralClass, pillSuccessClass, primaryButtonClass,
} from "./quizStyles"

// "Quizzes" section on the course page for an enrolled student
export function StudentCourseQuizzes({ courseId }: { courseId: string }) {
    const [quizzes, setQuizzes] = useState<AvailableQuiz[] | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        listAvailableQuizzes(courseId)
            .then(setQuizzes)
            .catch(() => setError(true))
    }, [courseId])

    return (
        <section className="mt-10" aria-labelledby="course-quizzes-heading">
            <div className="flex items-center gap-2">
                <h2 id="course-quizzes-heading" className="font-display text-heading-sm text-ink">Quizzes</h2>
                {quizzes && <span className={pillBrandClass}>{quizzes.length}</span>}
            </div>

            {error ? (
                <p className="mt-4 text-sm font-semibold text-danger">Failed to load the quizzes for this course.</p>
            ) : !quizzes ? (
                <div className="mt-4 flex justify-center py-6"><Spinner label="Loading quizzes" /></div>
            ) : quizzes.length === 0 ? (
                <div className="mt-4 rounded-card border border-dashed border-line-strong bg-canvas p-8 text-center">
                    <ListChecks className="mx-auto size-6 text-ink-muted" aria-hidden="true" />
                    <p className="mt-3 font-bold text-ink">There are no quizzes in this course yet.</p>
                    <p className="mt-1 text-sm text-ink-soft">Check back soon, new quizzes will appear here.</p>
                </div>
            ) : (
                <ul className="mt-4 space-y-3">
                    {quizzes.map((quiz) => {
                        const latest = quiz.latestAttempt
                        const quizPath = `/course/${courseId}/quizzes/${quiz._id}`
                        return (
                            <li key={quiz._id} className="flex flex-col gap-4 rounded-card border border-line bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                <div className="min-w-0">
                                    <p className="font-bold text-ink">{quiz.title}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className={pillNeutralClass}>
                                            {quiz.totalQuestions === 1 ? "1 question" : `${quiz.totalQuestions} questions`}
                                        </span>
                                        <span className={pillBrandClass}>Pass: {quiz.passingScore}%</span>
                                        {latest && (
                                            <span className={latest.passed ? pillSuccessClass : pillDangerClass}>
                                                {latest.passed ? "Passed" : "Not passed"} · {latest.scorePercent}%
                                            </span>
                                        )}
                                    </div>
                                    {latest && (
                                        <p className="mt-2 text-xs text-ink-muted">
                                            Last attempt: {latest.correctCount}/{latest.totalQuestions} correct
                                            {latest.attemptCount > 1 && ` · ${latest.attemptCount} attempts`}
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2">
                                    {latest ? (
                                        <>
                                            <Link to={`${quizPath}/attempts/${latest.attemptId}`} className={`${outlineButtonClass} px-4 py-2 text-[13px]`}>
                                                View result
                                            </Link>
                                            <Link to={quizPath} className={`${outlineButtonClass} px-4 py-2 text-[13px]`} aria-label={`Retake ${quiz.title}`}>
                                                <RotateCcw className="size-4" aria-hidden="true" />
                                                Retake
                                            </Link>
                                        </>
                                    ) : (
                                        <Link to={quizPath} className={`${primaryButtonClass} px-4 py-2 text-[13px]`} aria-label={`Take ${quiz.title}`}>
                                            Take quiz
                                        </Link>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}
