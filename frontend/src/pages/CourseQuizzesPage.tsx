import { useEffect, useState } from "react"
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, ListChecks, Pen, Plus, Users } from "lucide-react"
import { SiteChrome } from "../components/SiteChrome"
import { Button, Spinner } from "../components/ui"
import {
    cardClass, eyebrowClass, outlineButtonClass, pageTitleClass, pillBrandClass,
    pillDangerClass, pillNeutralClass, pillSuccessClass, primaryButtonClass,
} from "../components/quiz/quizStyles"
import { AnswerReview } from "../components/quiz/AnswerReview"
import { CourseStudentsTable } from "../components/quiz/CourseStudentsTable"
import { useAuth } from "../hooks/useAuth"
import api from "../api/axios"
import { getCourseStudents, getLatestAttempts, listQuizzesForCourse } from "../services/quizService"
import type { Course } from "../types/course"
import type { CourseStudentsReport, LatestQuizAttempt, QuizWithStats } from "../types/quiz"

function formatDate(value: string) {
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

function serverMessage(err: unknown, fallback: string) {
    if (axios.isAxiosError(err) && typeof err.response?.data?.message === "string") {
        return err.response.data.message
    }
    return fallback
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
                        <AnswerReview key={index} answer={answer} number={index + 1} viewer="instructor" />
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

    // "Enrolled students" tab: loaded with the page so the tab can show the count
    const [studentsReport, setStudentsReport] = useState<CourseStudentsReport | null>(null)
    const [studentsError, setStudentsError] = useState<string | null>(null)
    const [searchParams, setSearchParams] = useSearchParams()
    const tab = searchParams.get("tab") === "students" ? "students" : "quizzes"

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
                const [quizList] = await Promise.all([
                    listQuizzesForCourse(courseId),
                    getCourseStudents(courseId)
                        .then(setStudentsReport)
                        .catch((err) => setStudentsError(serverMessage(err, "Failed to load the enrolled students."))),
                ])
                setQuizzes(quizList)
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
                                Edit your quizzes, see who enrolled, and how students did on their latest attempts.
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

                    <div role="tablist" aria-label="Course quizzes and students" className="mb-6 flex w-full max-w-md gap-1 rounded-[12px] bg-canvas-warm p-1">
                        {([
                            ["quizzes", `Quizzes (${quizzes.length})`],
                            ["students", `Enrolled students${studentsReport ? ` (${studentsReport.students.length})` : ""}`],
                        ] as const).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                id={`tab-${key}`}
                                aria-selected={tab === key}
                                aria-controls={`panel-${key}`}
                                onClick={() => setSearchParams(key === "students" ? { tab: "students" } : {}, { replace: true })}
                                className={`flex-1 rounded-[10px] px-2.5 py-2 text-[13px] font-bold transition ${tab === key ? "bg-canvas text-ink shadow-[0_1px_3px_rgb(18_24_38_/_0.14)]" : "text-ink-muted hover:text-ink"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {tab === "students" ? (
                        <div role="tabpanel" id="panel-students" aria-labelledby="tab-students">
                            {studentsError ? (
                                <p className="text-sm font-semibold text-danger">{studentsError}</p>
                            ) : studentsReport ? (
                                <CourseStudentsTable report={studentsReport} />
                            ) : (
                                <div className="flex justify-center py-6"><Spinner label="Loading students" /></div>
                            )}
                        </div>
                    ) : (
                        <div role="tabpanel" id="panel-quizzes" aria-labelledby="tab-quizzes">
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
                    )}
                </div>
            </main>
        </SiteChrome>
    )
}

export default CourseQuizzesPage
