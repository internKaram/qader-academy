import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, Check, CheckCircle2, ChevronDown, ChevronUp, ListChecks, Pen, Plus, Users, X } from "lucide-react"
import { SiteChrome } from "../components/SiteChrome"
import { Button, Spinner } from "../components/ui"
import {
    cardClass, eyebrowClass, outlineButtonClass, pageTitleClass, pillBrandClass,
    pillDangerClass, pillNeutralClass, pillSuccessClass, primaryButtonClass,
} from "../components/quiz/quizStyles"
import { useAuth } from "../hooks/useAuth"
import api from "../api/axios"
import { getLatestAttempts, listQuizzesForCourse } from "../services/quizService"
import type { Course } from "../types/course"
import type { LatestQuizAttempt, QuizAttemptAnswer, QuizWithStats } from "../types/quiz"

function formatDate(value: string) {
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

function serverMessage(err: unknown, fallback: string) {
    if (axios.isAxiosError(err) && typeof err.response?.data?.message === "string") {
        return err.response.data.message
    }
    return fallback
}

// One question from a student's attempt: their pick vs. the correct answer
function AnswerReview({ answer, number }: { answer: QuizAttemptAnswer; number: number }) {
    const skipped = answer.selectedIndex === null
    return (
        <div className="rounded-[20px] border border-line bg-canvas p-4">
            <div className="mb-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className={pillNeutralClass}>Question {number}</span>
                    <span
                        className={`grid size-5 place-items-center rounded-full ${answer.isCorrect ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                        aria-label={answer.isCorrect ? "Correct" : "Incorrect"}
                    >
                        {answer.isCorrect ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
                    </span>
                </div>
                <span className="text-xs font-semibold text-ink-muted">{answer.isCorrect ? 1 : 0}/1 pt</span>
            </div>
            <p className="mb-3 text-sm font-bold text-ink">{answer.questionText}</p>
            <div className="flex flex-col gap-2">
                {answer.options.map((option, oIndex) => {
                    const isCorrectOption = oIndex === answer.correctIndex
                    const isPicked = oIndex === answer.selectedIndex
                    let rowClass = "border-line bg-canvas"
                    let label: string | null = null
                    let labelClass = "text-ink-muted"
                    if (isCorrectOption) {
                        rowClass = "border-success bg-success-light"
                        label = isPicked ? "Student's answer · Correct" : "Correct answer"
                        labelClass = "text-success-dark"
                    } else if (isPicked) {
                        rowClass = "border-danger bg-danger-light"
                        label = "Student's answer"
                        labelClass = "text-danger-dark"
                    }
                    return (
                        <div key={oIndex} className={`flex items-center justify-between gap-3 rounded-control border-[1.5px] px-3.5 py-2.5 ${rowClass}`}>
                            <span className="text-[13px] text-ink">{option}</span>
                            {label && <span className={`shrink-0 text-[11px] font-extrabold ${labelClass}`}>{label}</span>}
                        </div>
                    )
                })}
            </div>
            {skipped && <p className="mt-2 text-xs font-semibold text-danger-dark">The student skipped this question.</p>}
        </div>
    )
}

// One student's latest attempt, with a toggle to see every answer
function AttemptRow({ attempt }: { attempt: LatestQuizAttempt }) {
    const [open, setOpen] = useState(false)
    const name = attempt.student.name ?? "Deleted student"
    const initial = name.trim().charAt(0).toUpperCase() || "?"

    return (
        <li className="border-t border-line first:border-t-0">
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas-warm text-sm font-extrabold text-ink-soft">
                        {initial}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{name}</p>
                        <p className="truncate text-xs text-ink-muted">
                            {attempt.student.email ? `${attempt.student.email} · ` : ""}Submitted {formatDate(attempt.submittedAt)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                    <span className="text-sm font-extrabold text-ink">
                        {attempt.correctCount}/{attempt.totalQuestions}
                        <span className="ml-1 font-semibold text-ink-muted">· {Math.round(attempt.scorePercent)}%</span>
                    </span>
                    <span className={attempt.passed ? pillSuccessClass : pillDangerClass}>
                        {attempt.passed ? "Passed" : "Not passed"}
                    </span>
                    <span className={pillNeutralClass}>
                        {attempt.attemptCount === 1 ? "1 attempt" : `${attempt.attemptCount} attempts`}
                    </span>
                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        aria-expanded={open}
                        className="inline-flex items-center gap-1 text-[13px] font-bold text-brand-700 transition hover:text-brand-600"
                    >
                        {open ? "Hide answers" : "View answers"}
                        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="mb-4 space-y-3 rounded-card bg-canvas-soft p-3 sm:p-4">
                    <p className="text-xs font-semibold text-ink-muted">
                        Latest attempt · needed {attempt.passingScore}% to pass
                    </p>
                    {attempt.answers.map((answer, index) => (
                        <AnswerReview key={index} answer={answer} number={index + 1} />
                    ))}
                </div>
            )}
        </li>
    )
}

// Loads and lists the latest attempt of every student for one quiz
function QuizResults({ quizId }: { quizId: string }) {
    const [attempts, setAttempts] = useState<LatestQuizAttempt[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getLatestAttempts(quizId)
            .then(setAttempts)
            .catch((err) => setError(serverMessage(err, "Failed to load student results.")))
    }, [quizId])

    if (error) {
        return <p className="py-4 text-sm font-semibold text-danger">{error}</p>
    }
    if (!attempts) {
        return <div className="flex justify-center py-6"><Spinner label="Loading results" /></div>
    }
    if (attempts.length === 0) {
        return (
            <div className="py-6 text-center">
                <p className="text-sm font-bold text-ink">No students have taken this quiz yet.</p>
                <p className="mt-1 text-xs text-ink-muted">Each student's latest attempt will show up here after they submit it.</p>
            </div>
        )
    }

    const passedCount = attempts.filter((attempt) => attempt.passed).length
    return (
        <div>
            <p className="pt-4 text-xs font-semibold text-ink-muted">
                {attempts.length} {attempts.length === 1 ? "student" : "students"} · {passedCount} passed · showing each student's latest attempt
            </p>
            <ul>
                {attempts.map((attempt) => (
                    <AttemptRow key={attempt._id} attempt={attempt} />
                ))}
            </ul>
        </div>
    )
}

function QuizCard({ quiz, courseId }: { quiz: QuizWithStats; courseId: string }) {
    const [showResults, setShowResults] = useState(false)
    const questionCount = quiz.questions.length

    return (
        <article className={`${cardClass} p-5 sm:p-6`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-lg font-extrabold text-ink">{quiz.title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={pillNeutralClass}>{questionCount === 1 ? "1 question" : `${questionCount} questions`}</span>
                        <span className={pillBrandClass}>Pass: {quiz.passingScore}%</span>
                        <span className={pillNeutralClass}>
                            <Users className="mr-1 size-3.5" aria-hidden="true" />
                            {quiz.studentCount === 1 ? "1 student" : `${quiz.studentCount} students`}
                        </span>
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">
                        Created {formatDate(quiz.createdAt)}
                        {quiz.updatedAt !== quiz.createdAt && ` · Updated ${formatDate(quiz.updatedAt)}`}
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <Link to={`/instructor/courses/${courseId}/quizzes/${quiz._id}/edit`} className={`${outlineButtonClass} px-4 py-2 text-[13px]`}>
                        <Pen className="size-4" aria-hidden="true" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => setShowResults((value) => !value)}
                        aria-expanded={showResults}
                        className={`${showResults ? outlineButtonClass : primaryButtonClass} px-4 py-2 text-[13px]`}
                    >
                        <ListChecks className="size-4" aria-hidden="true" />
                        {showResults ? "Hide results" : "Student results"}
                    </button>
                </div>
            </div>

            {showResults && (
                <div className="mt-5 border-t border-line">
                    <QuizResults quizId={quiz._id} />
                </div>
            )}
        </article>
    )
}

function CourseQuizzesPage() {
    const { courseId } = useParams<{ courseId: string }>()
    const { user } = useAuth()
    const location = useLocation()
    const notice = (location.state as { notice?: string } | null)?.notice ?? null

    const [courseTitle, setCourseTitle] = useState("")
    const [quizzes, setQuizzes] = useState<QuizWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!courseId || !user) return
        const fetchData = async () => {
            try {
                const courseResponse = await api.get<Course>(`/courses/${courseId}`)
                if (user.id !== courseResponse.data.instructorId && user.role !== "admin") {
                    setError("You are not authorized to view quizzes for this course.")
                    return
                }
                setCourseTitle(courseResponse.data.title)
                setQuizzes(await listQuizzesForCourse(courseId))
            } catch (err) {
                setError(serverMessage(err, "Failed to load quizzes for this course."))
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [courseId, user])

    if (loading) {
        return <main className="grid min-h-screen place-items-center bg-canvas-soft"><Spinner size="lg" label="Loading quizzes" /></main>
    }

    if (error || !courseId) {
        return (
            <main className="grid min-h-screen place-items-center bg-canvas-soft p-8 text-center">
                <div>
                    <p className="text-ink-soft">{error ?? "Course not found."}</p>
                    <Link to="/catalog">
                        <Button variant="outline" className="mt-4">Back to catalog</Button>
                    </Link>
                </div>
            </main>
        )
    }

    const newQuizPath = `/instructor/courses/${courseId}/quizzes/new`

    return (
        <SiteChrome>
            <main className="min-h-screen bg-canvas-soft pt-28 pb-16 text-ink">
                <div className="page-container max-w-5xl">
                    <Link to="/catalog" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-brand-700">
                        <ArrowLeft className="size-4" />
                        Back to catalog
                    </Link>

                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className={`mb-2.5 ${eyebrowClass}`}>{courseTitle} &nbsp;›&nbsp; Quizzes</p>
                            <div className="mb-1.5 flex flex-wrap items-center gap-3">
                                <h1 className={pageTitleClass}>Quizzes for this course</h1>
                                <span className={pillBrandClass}>{quizzes.length}</span>
                            </div>
                            <p className="text-[13px] font-semibold text-ink-muted">
                                Edit your quizzes and see how students did on their latest attempts.
                            </p>
                        </div>
                        <Link to={newQuizPath} className={`${primaryButtonClass} shrink-0 self-start px-4 py-2.5 text-sm sm:self-auto`}>
                            <Plus className="size-4" aria-hidden="true" />
                            Create Quiz
                        </Link>
                    </div>

                    {notice && (
                        <div role="status" className="mb-6 flex items-center gap-2 rounded-control border border-success/20 bg-success-light px-4 py-3 text-sm font-bold text-success-dark">
                            <CheckCircle2 className="size-4 shrink-0" />
                            {notice}
                        </div>
                    )}

                    {quizzes.length === 0 ? (
                        <div className="rounded-card border-2 border-dashed border-line-strong bg-canvas-soft p-10 text-center">
                            <h2 className="text-lg font-extrabold text-ink">No quizzes yet</h2>
                            <p className="mt-1 text-sm text-ink-muted">Create the first quiz for {courseTitle}.</p>
                            <Link to={newQuizPath} className={`${primaryButtonClass} mt-5 px-4 py-2.5 text-sm`}>
                                <Plus className="size-4" aria-hidden="true" />
                                Create Quiz
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quizzes.map((quiz) => (
                                <QuizCard key={quiz._id} quiz={quiz} courseId={courseId} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </SiteChrome>
    )
}

export default CourseQuizzesPage
