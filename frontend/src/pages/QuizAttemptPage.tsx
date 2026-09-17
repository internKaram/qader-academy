import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react"
import { SiteChrome } from "../components/SiteChrome"
import { Spinner } from "../components/ui"
import { AnswerReview } from "../components/quiz/AnswerReview"
import { outlineButtonClass, pillDangerClass, pillSuccessClass, primaryButtonClass } from "../components/quiz/quizStyles"
import { getMyAttempt } from "../services/quizService"
import type { StudentQuizAttempt } from "../types/quiz"

function serverMessage(err: unknown, fallback: string) {
    if (axios.isAxiosError(err) && typeof err.response?.data?.message === "string") {
        return err.response.data.message
    }
    return fallback
}

function formatDate(value: string) {
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

// Same rule as the server: correct / total >= passingScore / 100
function correctNeededToPass(passingScore: number, totalQuestions: number) {
    return Math.ceil((passingScore * totalQuestions) / 100)
}

interface QuizAttemptPageProps {
    mode: "result" | "review"
}

// After submitting: the result card ("Results" in the design) and, on its own URL,
// every question with the right answer ("Review Answers").
function QuizAttemptPage({ mode }: QuizAttemptPageProps) {
    const { courseId, quizId, attemptId } = useParams<{ courseId: string; quizId: string; attemptId: string }>()
    const location = useLocation()

    // The quiz page passes the graded attempt along, so there is no second request right after submitting
    const passed = (location.state as { attempt?: StudentQuizAttempt } | null)?.attempt
    const initialAttempt = passed && passed._id === attemptId ? passed : null

    const [attempt, setAttempt] = useState<StudentQuizAttempt | null>(initialAttempt)
    const [error, setError] = useState<string | null>(null)

    // The router keeps the old scroll position (e.g. the bottom of the quiz), so start at the top
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" })
    }, [mode, attemptId])

    useEffect(() => {
        if (attempt || !quizId || !attemptId) return
        getMyAttempt(quizId, attemptId)
            .then(setAttempt)
            .catch((err) => setError(serverMessage(err, "Failed to load this result.")))
    }, [attempt, quizId, attemptId])

    const coursePath = `/course/${courseId}`
    const quizPath = `/course/${courseId}/quizzes/${quizId}`
    const resultPath = `${quizPath}/attempts/${attemptId}`

    if (error) {
        return (
            <SiteChrome>
                <main className="grid min-h-screen place-items-center bg-canvas-soft px-4 pt-28 pb-16 text-center">
                    <div className="max-w-md">
                        <h1 className="font-display text-heading-sm text-ink">Can't open this result</h1>
                        <p className="mt-2 text-ink-soft">{error}</p>
                        <Link to={coursePath} className={`${outlineButtonClass} mt-5 px-4 py-2.5 text-sm`}>
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Back to course
                        </Link>
                    </div>
                </main>
            </SiteChrome>
        )
    }

    if (!attempt) {
        return <main className="grid min-h-screen place-items-center bg-canvas-soft"><Spinner size="lg" label="Loading result" /></main>
    }

    const title = attempt.quizTitle ?? "Quiz"
    const needed = correctNeededToPass(attempt.passingScore, attempt.totalQuestions)

    if (mode === "review") {
        return (
            <SiteChrome>
                <main className="min-h-screen bg-canvas-soft pt-18 text-ink">
                    <div className="bg-canvas shadow-[0_10px_30px_rgb(18_24_38_/_0.04)]">
                        <div className="page-container flex flex-wrap items-center justify-between gap-3 py-4">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <Link to={resultPath} state={{ attempt }} aria-label="Back to results" className="text-ink-muted transition hover:text-brand-700">
                                    <ArrowLeft className="size-5" />
                                </Link>
                                <h1 className="text-[17px] font-extrabold text-ink">Review — {title}</h1>
                            </div>
                            <Link to={resultPath} state={{ attempt }} className="text-[13px] font-bold text-brand-700 transition hover:text-brand-600">
                                Back to Results
                            </Link>
                        </div>
                    </div>

                    <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-10">
                        <div className="mb-5 flex flex-wrap items-center gap-2.5">
                            <span className={attempt.passed ? pillSuccessClass : pillDangerClass}>
                                {attempt.passed ? "Passed" : "Not passed"}
                            </span>
                            <span className="text-[13px] font-semibold text-ink-muted">
                                {attempt.correctCount} of {attempt.totalQuestions} correct · {attempt.scorePercent}% · submitted {formatDate(attempt.submittedAt)}
                            </span>
                        </div>
                        <div className="space-y-[18px]">
                            {attempt.answers.map((answer, index) => (
                                <AnswerReview key={index} answer={answer} number={index + 1} viewer="student" size="lg" />
                            ))}
                        </div>
                        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                            <Link to={coursePath} className={`${outlineButtonClass} px-5 py-3 text-sm`}>Back to Course</Link>
                            <Link to={quizPath} className={`${primaryButtonClass} px-5 py-3 text-sm`}>
                                <RotateCcw className="size-4" aria-hidden="true" />
                                Retake Quiz
                            </Link>
                        </div>
                    </div>
                </main>
            </SiteChrome>
        )
    }

    return (
        <SiteChrome>
            <main className="flex min-h-screen justify-center bg-canvas-soft px-4 pt-32 pb-16 text-ink">
                <div className="h-fit w-full max-w-[420px] rounded-[32px] bg-canvas px-6 py-10 text-center shadow-[0_24px_64px_rgb(18_24_38_/_0.14)] sm:px-8">
                    <div
                        className={`mx-auto mb-5 grid size-16 place-items-center rounded-full border-2 ${attempt.passed ? "border-success bg-success-light text-success" : "border-danger bg-danger-light text-danger"}`}
                        aria-hidden="true"
                    >
                        {attempt.passed ? <Check className="size-7" strokeWidth={3} /> : <X className="size-7" strokeWidth={3} />}
                    </div>
                    <p className="mb-1 text-xs font-bold text-ink-muted">{title}</p>
                    <h1 className="mb-2 font-display text-[23px] font-extrabold text-ink">
                        {attempt.passed ? "Quiz Passed" : "Quiz Not Passed"}
                    </h1>
                    <p className="mb-6 text-sm text-ink-muted">
                        You answered {attempt.correctCount} of {attempt.totalQuestions} correctly — you need {needed} to pass.
                    </p>
                    <p className="text-[38px] font-black leading-tight text-ink">
                        {attempt.correctCount}
                        <span className="text-xl font-semibold text-ink-muted">/{attempt.totalQuestions} pts</span>
                    </p>
                    <p className="mb-7 text-[13px] font-semibold text-ink-muted">
                        {attempt.scorePercent}% · {attempt.passingScore}% needed to pass
                    </p>
                    <div className="flex flex-col gap-2.5">
                        <Link to={`${resultPath}/review`} state={{ attempt }} className={`${outlineButtonClass} px-4 py-3 text-sm`}>
                            Review Answers
                        </Link>
                        {attempt.passed ? (
                            <Link to={coursePath} className={`${primaryButtonClass} px-4 py-3 text-sm`}>Back to Course</Link>
                        ) : (
                            <>
                                <Link to={quizPath} className={`${primaryButtonClass} px-4 py-3 text-sm`}>
                                    <RotateCcw className="size-4" aria-hidden="true" />
                                    Retake Quiz
                                </Link>
                                <Link to={coursePath} className="pt-1 text-[13px] font-bold text-ink-muted transition hover:text-brand-700">
                                    Back to Course
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </SiteChrome>
    )
}

export default QuizAttemptPage
