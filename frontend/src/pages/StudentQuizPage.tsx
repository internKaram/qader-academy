import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { SiteChrome } from "../components/SiteChrome"
import { Spinner } from "../components/ui"
import { outlineButtonClass, pillNeutralClass, primaryButtonClass } from "../components/quiz/quizStyles"
import api from "../api/axios"
import { getQuizToTake, submitQuizAttempt } from "../services/quizService"
import type { Course } from "../types/course"
import type { StudentQuiz } from "../types/quiz"

function serverMessage(err: unknown, fallback: string) {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data
        if (typeof data?.message === "string") return data.message
        if (Array.isArray(data?.errors) && typeof data.errors[0]?.message === "string") return data.errors[0].message
    }
    return fallback
}

// The quiz changed (questions re-saved) while the student was answering
function isStaleQuizError(err: unknown) {
    return axios.isAxiosError(err)
        && err.response?.status === 400
        && Array.isArray(err.response.data?.errors)
        && err.response.data.errors.some((e: { field?: string }) => e.field?.endsWith(".questionId"))
}

// Student quiz runner ("Student · Quiz Runner" in the Quiz Engine UI design):
// every question on one page, Submit unlocks once all are answered.
function StudentQuizPage() {
    const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>()
    const navigate = useNavigate()

    const [quiz, setQuiz] = useState<StudentQuiz | null>(null)
    const [courseTitle, setCourseTitle] = useState("")
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    // questionId -> chosen option index
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [quizChanged, setQuizChanged] = useState(false)

    useEffect(() => {
        if (!courseId || !quizId) return
        // Opened from further down the course page: start at the first question
        window.scrollTo({ top: 0, behavior: "instant" })
        const load = async () => {
            try {
                const [quizData, courseResponse] = await Promise.all([
                    getQuizToTake(quizId),
                    api.get<Course>(`/courses/${courseId}`),
                ])
                if (quizData.courseId !== courseId) {
                    setLoadError("This quiz is not part of this course.")
                    return
                }
                setQuiz(quizData)
                setCourseTitle(courseResponse.data.title)
            } catch (err) {
                setLoadError(serverMessage(err, "Failed to load the quiz. Please try again."))
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [courseId, quizId])

    const answeredCount = quiz ? quiz.questions.filter((q) => answers[q._id] !== undefined).length : 0
    const hasUnsubmittedAnswers = answeredCount > 0 && !submitting

    // Warn before closing or reloading the tab with answers that were not submitted
    useEffect(() => {
        if (!hasUnsubmittedAnswers) return
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault()
        }
        window.addEventListener("beforeunload", warn)
        return () => window.removeEventListener("beforeunload", warn)
    }, [hasUnsubmittedAnswers])

    function selectOption(questionId: string, optionIndex: number) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
        setSubmitError(null)
    }

    async function handleSubmit() {
        if (!quiz || !courseId || !quizId || answeredCount < quiz.totalQuestions) return
        setSubmitting(true)
        setSubmitError(null)
        try {
            const attempt = await submitQuizAttempt(quizId, {
                answers: quiz.questions.map((q) => ({ questionId: q._id, selectedIndex: answers[q._id] ?? null })),
            })
            // replace: the browser Back button goes to the course, not to the answered form
            navigate(`/course/${courseId}/quizzes/${quizId}/attempts/${attempt._id}`, { replace: true, state: { attempt } })
        } catch (err) {
            if (isStaleQuizError(err)) {
                setQuizChanged(true)
            } else {
                setSubmitError(serverMessage(err, "Failed to submit the quiz. Please try again."))
            }
            setSubmitting(false)
        }
    }

    const coursePath = `/course/${courseId}`

    if (loading) {
        return <main className="grid min-h-screen place-items-center bg-canvas-soft"><Spinner size="lg" label="Loading quiz" /></main>
    }

    if (loadError || !quiz) {
        return (
            <SiteChrome>
                <main className="grid min-h-screen place-items-center bg-canvas-soft px-4 pt-28 pb-16 text-center">
                    <div className="max-w-md">
                        <h1 className="font-display text-heading-sm text-ink">Can't open this quiz</h1>
                        <p className="mt-2 text-ink-soft">{loadError ?? "Quiz not found."}</p>
                        <Link to={coursePath} className={`${outlineButtonClass} mt-5 px-4 py-2.5 text-sm`}>
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Back to course
                        </Link>
                    </div>
                </main>
            </SiteChrome>
        )
    }

    const total = quiz.totalQuestions
    const progressPercent = total === 0 ? 0 : Math.round((answeredCount / total) * 100)
    const allAnswered = answeredCount === total
    const answeredLabel = `${answeredCount} of ${total} answered`

    return (
        <SiteChrome>
            <main className="min-h-screen bg-canvas-soft pt-18 text-ink">
                {/* Quiz header: title + progress */}
                <div className="border-b border-line bg-canvas-soft">
                    <div className="page-container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <Link to={coursePath} className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted transition hover:text-brand-700">
                                <ArrowLeft className="size-3.5" aria-hidden="true" />
                                {courseTitle}
                            </Link>
                            <h1 className="text-[17px] font-extrabold text-ink">{quiz.title}</h1>
                        </div>
                        <div className="flex shrink-0 items-center gap-2.5">
                            <span className="text-[13px] font-bold text-brand-700" aria-live="polite">{answeredLabel}</span>
                            <div
                                className="h-2 w-[140px] overflow-hidden rounded-pill bg-canvas-warm"
                                role="progressbar"
                                aria-label="Questions answered"
                                aria-valuemin={0}
                                aria-valuemax={total}
                                aria-valuenow={answeredCount}
                            >
                                <div className="h-full rounded-pill bg-brand-600 transition-[width]" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-b border-warning/25 bg-warning-light px-4 py-2 text-center text-xs font-semibold text-warning-dark">
                    Your answers are only saved when you submit. Leaving this page will lose them.
                </div>

                {/* Questions */}
                <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-10">
                    <p className="mb-5 text-[13px] font-semibold text-ink-muted">
                        {total} {total === 1 ? "question" : "questions"} · 1 pt each · you need {quiz.passingScore}% to pass
                    </p>

                    {quiz.questions.map((question, qIndex) => (
                        <fieldset key={question._id} className="mb-[18px] rounded-card border border-line bg-canvas p-5 sm:p-[22px]">
                            <div className="mb-3.5 flex items-center justify-between">
                                <span className={pillNeutralClass}>Question {qIndex + 1}</span>
                                <span className="text-xs font-semibold text-ink-muted">1 pt</span>
                            </div>
                            <legend className="sr-only">Question {qIndex + 1}</legend>
                            <p className="mb-4 text-base font-bold text-ink">{question.text}</p>
                            <div className="flex flex-col gap-2.5">
                                {question.options.map((option, oIndex) => {
                                    const selected = answers[question._id] === oIndex
                                    return (
                                        <label
                                            key={oIndex}
                                            className={`flex cursor-pointer items-center gap-3 rounded-control border-[1.5px] px-3.5 py-3 transition has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-brand-600/40 ${selected ? "border-brand-600 bg-brand-50" : "border-line bg-canvas hover:border-line-strong"}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${question._id}`}
                                                value={oIndex}
                                                checked={selected}
                                                onChange={() => selectOption(question._id, oIndex)}
                                                disabled={submitting}
                                                className="sr-only"
                                            />
                                            <span
                                                aria-hidden="true"
                                                className={`size-[18px] shrink-0 rounded-full border-2 ${selected ? "border-brand-600 bg-brand-600 shadow-[inset_0_0_0_3px_#fff]" : "border-line-strong bg-canvas"}`}
                                            />
                                            <span className="text-sm text-ink">{option}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </fieldset>
                    ))}

                    {quizChanged && (
                        <div role="alert" className="mb-4 rounded-control border border-warning/25 bg-warning-light px-4 py-3 text-sm font-semibold text-warning-dark">
                            <p>The instructor updated this quiz while you were answering, so these answers can't be graded.</p>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className={`${outlineButtonClass} mt-3 px-3.5 py-2 text-[13px]`}
                            >
                                <RotateCcw className="size-4" aria-hidden="true" />
                                Reload the quiz
                            </button>
                        </div>
                    )}
                    {submitError && (
                        <div role="alert" className="mb-4 rounded-control border border-danger/20 bg-danger-light px-4 py-3 text-sm font-bold text-danger-dark">
                            {submitError}
                        </div>
                    )}
                </div>

                {/* Footer: progress + submit */}
                <div className="sticky bottom-0 z-10 border-t border-line bg-canvas">
                    <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-4 py-4 sm:px-10">
                        <span className="text-[13px] font-semibold text-ink-muted">
                            {allAnswered ? "All questions answered" : answeredLabel}
                        </span>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!allAnswered || submitting || quizChanged}
                            title={allAnswered ? undefined : "Answer every question to submit"}
                            className={`${primaryButtonClass} px-6 py-[11px] text-sm`}
                        >
                            {submitting ? "Submitting…" : "Submit Quiz"}
                        </button>
                    </div>
                </div>
            </main>
        </SiteChrome>
    )
}

export default StudentQuizPage
