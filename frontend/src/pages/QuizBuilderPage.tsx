import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { ArrowLeft, CheckCircle2, Plus, Save, Trash2 } from "lucide-react"
import { SiteChrome } from "../components/SiteChrome"
import { Button, Spinner } from "../components/ui"
import {
    eyebrowClass, outlineButtonClass, pageTitleClass, pillBrandClass,
    pillNeutralClass, pillSuccessClass, pillWarningClass, primaryButtonClass,
} from "../components/quiz/quizStyles"
import { useAuth } from "../hooks/useAuth"
import api from "../api/axios"
import { extractFieldErrors, isFieldValidationError } from "../api/apiErrors"
import { createQuiz, deleteQuiz, getQuiz, updateQuiz } from "../services/quizService"
import type { Course } from "../types/course"
import type { Quiz, QuizInput } from "../types/quiz"

const OPTION_LABELS = ["A", "B", "C", "D"]
const DEFAULT_PASSING_SCORE = 70
const PASSING_SCORE_STEP = 5

const labelClass = "mb-1.5 block text-[13px] font-bold text-ink"
const stepperButtonClass =
    "grid size-7 place-items-center rounded-[9px] bg-canvas-soft text-[15px] font-extrabold text-ink-soft ring-1 ring-inset ring-line transition hover:bg-canvas-warm"

const fieldClass = (hasError: boolean) =>
    `w-full rounded-control border bg-canvas px-3.5 py-[11px] text-sm text-ink transition placeholder:text-ink-muted/70 focus:outline-none focus:ring-4 ${
        hasError ? "border-danger focus:ring-danger/15" : "border-line-strong focus:border-brand-600 focus:ring-brand-600/15"
    }`

function FieldError({ message, className = "mt-1.5" }: { message?: string; className?: string }) {
    if (!message) return null
    return <p className={`${className} text-xs font-semibold text-danger`}>{message}</p>
}

// A question while it is being edited. `key` is only for React lists;
// correctIndex is null until the instructor picks the right option.
interface DraftQuestion {
    key: string
    text: string
    options: string[]
    correctIndex: number | null
}

let keyCounter = 0
const newKey = () => `question-${keyCounter++}`

const emptyQuestion = (): DraftQuestion => ({
    key: newKey(),
    text: "",
    options: ["", "", "", ""],
    correctIndex: null,
})

// Error keys match the backend's field names, e.g. "questions[0].options[2]",
// so client-side and server-side errors can be shown in the same place.
function validateDraft(title: string, passingScore: string, questions: DraftQuestion[]) {
    const errors: Record<string, string> = {}
    const score = Number(passingScore)

    if (!title.trim()) errors.title = "Quiz title is required"
    if (passingScore.trim() === "" || !Number.isInteger(score) || score < 0 || score > 100) {
        errors.passingScore = "Passing score must be a whole number between 0 and 100"
    }
    if (questions.length === 0) errors.questions = "A quiz must have at least 1 question"

    questions.forEach((question, qIndex) => {
        if (!question.text.trim()) errors[`questions[${qIndex}].text`] = "Question text is required"
        question.options.forEach((option, oIndex) => {
            if (!option.trim()) errors[`questions[${qIndex}].options[${oIndex}]`] = "Option text is required"
        })
        if (question.correctIndex === null) errors[`questions[${qIndex}].correctIndex`] = "Choose the correct option"
    })

    return errors
}

function toDraft(quiz: Quiz): DraftQuestion[] {
    return quiz.questions.map((question) => ({
        key: newKey(),
        text: question.text,
        options: [...question.options],
        correctIndex: question.correctIndex,
    }))
}

function serverMessage(err: unknown, fallback: string) {
    if (axios.isAxiosError(err) && typeof err.response?.data?.message === "string") {
        return err.response.data.message
    }
    return fallback
}

// Routes:
//   /instructor/courses/:courseId/quizzes/new           -> blank builder, "Create Quiz" saves a new quiz
//   /instructor/courses/:courseId/quizzes/:quizId/edit  -> loads that quiz, "Save Changes" updates it
// The key makes React start from a clean form whenever the URL points at a different quiz.
function QuizBuilderRoute() {
    const { courseId, quizId } = useParams<{ courseId: string; quizId?: string }>()
    return <QuizBuilderPage key={`${courseId}:${quizId ?? "new"}`} />
}

function QuizBuilderPage() {
    const { courseId, quizId: routeQuizId } = useParams<{ courseId: string; quizId?: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const quizzesPath = `/instructor/courses/${courseId}/quizzes`

    const [courseTitle, setCourseTitle] = useState("")
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    const [quizId, setQuizId] = useState<string | null>(null)
    const [title, setTitle] = useState("")
    const [passingScore, setPassingScore] = useState(String(DEFAULT_PASSING_SCORE))
    const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()])

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [actionError, setActionError] = useState<string | null>(null)
    // A message passed along by the page we came from (e.g. "Quiz created...")
    const [notice, setNotice] = useState<string | null>(
        (location.state as { notice?: string } | null)?.notice ?? null
    )
    const [dirty, setDirty] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!courseId || !user) return
        const fetchData = async () => {
            try {
                const courseResponse = await api.get<Course>(`/courses/${courseId}`)
                if (user.id !== courseResponse.data.instructorId && user.role !== "admin") {
                    setLoadError("You are not authorized to manage quizzes for this course.")
                    return
                }
                setCourseTitle(courseResponse.data.title)

                // No quiz id in the URL means a brand new quiz: keep the blank form
                if (!routeQuizId) return

                const quiz = await getQuiz(routeQuizId)
                if (quiz.courseId !== courseId) {
                    setLoadError("This quiz does not belong to this course.")
                    return
                }
                setQuizId(quiz._id)
                setTitle(quiz.title)
                setPassingScore(String(quiz.passingScore))
                setQuestions(toDraft(quiz))
            } catch (err) {
                setLoadError(serverMessage(err, "Failed to load the quiz."))
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [courseId, routeQuizId, user])

    // Warn before closing or reloading the tab with unsaved edits
    useEffect(() => {
        if (!dirty) return
        const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [dirty])

    function markChanged(...errorKeys: string[]) {
        setDirty(true)
        setNotice(null)
        if (errorKeys.length === 0) return
        setErrors((prev) => {
            if (!errorKeys.some((key) => prev[key])) return prev
            const next = { ...prev }
            errorKeys.forEach((key) => delete next[key])
            return next
        })
    }

    function updateQuestion(qIndex: number, changes: Partial<DraftQuestion>) {
        setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, ...changes } : q)))
    }

    function handleQuestionText(qIndex: number, text: string) {
        updateQuestion(qIndex, { text })
        markChanged(`questions[${qIndex}].text`)
    }

    function handleOptionText(qIndex: number, oIndex: number, value: string) {
        const options = [...questions[qIndex].options]
        options[oIndex] = value
        updateQuestion(qIndex, { options })
        markChanged(`questions[${qIndex}].options[${oIndex}]`, `questions[${qIndex}].options`)
    }

    function handleCorrectOption(qIndex: number, oIndex: number) {
        updateQuestion(qIndex, { correctIndex: oIndex })
        markChanged(`questions[${qIndex}].correctIndex`)
    }

    function handleAddQuestion() {
        setQuestions((prev) => [...prev, emptyQuestion()])
        markChanged("questions")
    }

    function handleRemoveQuestion(qIndex: number) {
        setQuestions((prev) => prev.filter((_, i) => i !== qIndex))
        // Error keys are index-based, so they no longer line up after a removal
        setErrors({})
        markChanged()
    }

    // The − / + buttons next to the passing score
    function stepPassingScore(delta: number) {
        const current = Number(passingScore)
        const base = Number.isFinite(current) ? Math.round(current) : DEFAULT_PASSING_SCORE
        setPassingScore(String(Math.min(100, Math.max(0, base + delta))))
        markChanged("passingScore")
    }

    // Checks the form and builds the request body; returns null (and shows errors) if invalid
    function buildInput(): QuizInput | null {
        setActionError(null)
        setNotice(null)

        const clientErrors = validateDraft(title, passingScore, questions)
        setErrors(clientErrors)
        if (Object.keys(clientErrors).length > 0) {
            setActionError("Please fix the highlighted fields before saving.")
            return null
        }

        return {
            title: title.trim(),
            passingScore: Number(passingScore),
            questions: questions.map((q) => ({
                text: q.text.trim(),
                options: q.options.map((option) => option.trim()),
                correctIndex: q.correctIndex as number,
            })),
        }
    }

    function handleSaveError(err: unknown) {
        if (isFieldValidationError(err)) {
            setErrors(extractFieldErrors(err))
            setActionError("Please fix the highlighted fields before saving.")
        } else {
            setActionError(serverMessage(err, "Failed to save the quiz. Please try again."))
        }
    }

    // "Create Quiz": saves this form as a new quiz linked to the course,
    // then switches the page to editing that quiz.
    async function handleCreate() {
        if (!courseId || quizId) return
        const input = buildInput()
        if (!input) return

        setSaving(true)
        try {
            const created = await createQuiz(courseId, input)
            setDirty(false)
            navigate(`${quizzesPath}/${created._id}/edit`, {
                replace: true,
                state: { notice: "Quiz created and linked to this course." },
            })
        } catch (err) {
            handleSaveError(err)
            setSaving(false)
        }
    }

    // "Save Changes": updates the quiz that is already saved
    async function handleSaveChanges() {
        if (!quizId) return
        const input = buildInput()
        if (!input) return

        setSaving(true)
        try {
            await updateQuiz(quizId, input)
            setDirty(false)
            setNotice("Quiz changes saved.")
        } catch (err) {
            handleSaveError(err)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!quizId) return
        if (!window.confirm("Delete this quiz, all its questions and all student attempts? This cannot be undone.")) return

        setActionError(null)
        setNotice(null)
        setDeleting(true)
        try {
            await deleteQuiz(quizId)
            setDirty(false)
            navigate(quizzesPath, { replace: true, state: { notice: `"${title.trim() || "Quiz"}" was deleted.` } })
        } catch (err) {
            setActionError(serverMessage(err, "Failed to delete the quiz. Please try again."))
            setDeleting(false)
        }
    }

    if (loading) {
        return <main className="grid min-h-screen place-items-center bg-canvas-soft"><Spinner size="lg" label="Loading quiz" /></main>
    }

    if (loadError) {
        return (
            <main className="grid min-h-screen place-items-center bg-canvas-soft p-8 text-center">
                <div>
                    <p className="text-ink-soft">{loadError}</p>
                    <Link to="/catalog">
                        <Button variant="outline" className="mt-4">Back to catalog</Button>
                    </Link>
                </div>
            </main>
        )
    }

    const isCreated = quizId !== null
    const busy = saving || deleting
    const questionCount = questions.length
    const scoreNumber = Number(passingScore)
    const neededToPass = Number.isFinite(scoreNumber) ? Math.ceil((scoreNumber / 100) * questionCount) : 0
    const completedQuestions = questions.filter(
        (q) => q.text.trim() && q.options.every((option) => option.trim()) && q.correctIndex !== null
    ).length

    return (
        <SiteChrome>
            <main className="min-h-screen bg-canvas-soft pt-28 pb-16 text-ink">
                <div className="page-container">
                    <Link to={quizzesPath} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-brand-700">
                        <ArrowLeft className="size-4" />
                        Back to quizzes
                    </Link>

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                        <form
                            className="min-w-0 flex-1"
                            noValidate
                            onSubmit={(event) => {
                                event.preventDefault()
                                if (isCreated) handleSaveChanges()
                                else handleCreate()
                            }}
                        >
                            <p className={`mb-2.5 ${eyebrowClass}`}>
                                {courseTitle} &nbsp;›&nbsp; Quizzes
                            </p>
                            <div className="mb-1.5 flex flex-wrap items-center gap-3">
                                <h1 className={pageTitleClass}>
                                    {isCreated ? "Editing Quiz" : "Creating a Quiz"}
                                </h1>
                                <span className={pillBrandClass}>Instructor</span>
                                {dirty ? (
                                    <span className={pillWarningClass}>Unsaved changes</span>
                                ) : isCreated ? (
                                    <span className={pillSuccessClass}>Saved</span>
                                ) : (
                                    <span className={pillNeutralClass}>New quiz</span>
                                )}
                            </div>
                            <p className="mb-6 text-[13px] font-semibold text-ink-muted">
                                {isCreated
                                    ? "Edit the questions, then click Save Changes."
                                    : "Write the questions, pick the correct answers, then click Create Quiz."}
                            </p>

                            {notice && (
                                <div role="status" className="mb-6 flex items-center gap-2 rounded-control border border-success/20 bg-success-light px-4 py-3 text-sm font-bold text-success-dark">
                                    <CheckCircle2 className="size-4 shrink-0" />
                                    {notice}
                                </div>
                            )}
                            {actionError && (
                                <div role="alert" className="mb-6 rounded-control border border-danger/20 bg-danger-light px-4 py-3 text-sm font-bold text-danger-dark">
                                    {actionError}
                                </div>
                            )}

                            {/* Quiz settings */}
                            <section className="mb-8 rounded-card border border-line bg-canvas p-5 sm:p-6">
                                <h2 className="mb-4 text-[15px] font-extrabold text-ink">Quiz Settings</h2>

                                <div className="mb-4">
                                    <label htmlFor="quiz-title" className={labelClass}>Quiz Title</label>
                                    <input
                                        id="quiz-title"
                                        placeholder="e.g. CPU Design & Registers Quiz"
                                        value={title}
                                        onChange={(e) => { setTitle(e.target.value); markChanged("title") }}
                                        aria-invalid={errors.title ? true : undefined}
                                        className={fieldClass(Boolean(errors.title))}
                                    />
                                    <FieldError message={errors.title} />
                                </div>

                                <div className="mb-5">
                                    <p className={labelClass}>Attached to Course</p>
                                    <div className="rounded-control border border-line-strong bg-canvas-soft px-3.5 py-[11px] text-sm text-ink">
                                        {courseTitle}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-line pt-[18px] sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                                    <div>
                                        <label htmlFor="quiz-passing-score" className="mb-0.5 block text-[13px] font-bold text-ink">
                                            Score Needed to Pass
                                        </label>
                                        <p className="text-[12.5px] text-ink-muted">
                                            Students need {neededToPass} of {questionCount} {questionCount === 1 ? "question" : "questions"} correct. Default is {DEFAULT_PASSING_SCORE}%.
                                        </p>
                                    </div>
                                    <div
                                        className={`flex shrink-0 items-center gap-3.5 self-start rounded-control border py-[7px] pr-2 pl-3.5 sm:self-auto ${errors.passingScore ? "border-danger" : "border-line-strong"}`}
                                    >
                                        <div className="flex items-baseline text-sm font-bold text-ink">
                                            <input
                                                id="quiz-passing-score"
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={passingScore}
                                                onChange={(e) => { setPassingScore(e.target.value); markChanged("passingScore") }}
                                                aria-invalid={errors.passingScore ? true : undefined}
                                                className="w-10 bg-transparent text-right outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                            <span>%</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button type="button" className={stepperButtonClass} onClick={() => stepPassingScore(-PASSING_SCORE_STEP)} aria-label="Decrease passing score">−</button>
                                            <button type="button" className={stepperButtonClass} onClick={() => stepPassingScore(PASSING_SCORE_STEP)} aria-label="Increase passing score">+</button>
                                        </div>
                                    </div>
                                </div>
                                <FieldError message={errors.passingScore} />
                            </section>

                            {/* Questions */}
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-[15px] font-extrabold text-ink">Questions</h2>
                                    <span className={pillBrandClass}>{questionCount}</span>
                                </div>
                                <button type="button" onClick={handleAddQuestion} className={`${primaryButtonClass} px-4 py-2.5 text-[13px]`}>
                                    <Plus className="size-4" aria-hidden="true" />
                                    Add Question
                                </button>
                            </div>

                            <FieldError message={errors.questions} className="mb-3" />

                            {questions.map((question, qIndex) => {
                                const correctError = errors[`questions[${qIndex}].correctIndex`]
                                const optionsError = errors[`questions[${qIndex}].options`]
                                const textError = errors[`questions[${qIndex}].text`]
                                const textId = `question-${question.key}-text`
                                return (
                                    <div key={question.key} className="mb-4 rounded-card border border-line bg-canvas p-4 sm:p-5">
                                        <div className="mb-3.5 flex items-center justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <span className={pillNeutralClass}>Question {qIndex + 1}</span>
                                                <span className="text-xs font-semibold text-ink-muted">Multiple choice · 1 pt</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestion(qIndex)}
                                                disabled={questionCount === 1}
                                                aria-label={`Remove question ${qIndex + 1}`}
                                                title={questionCount === 1 ? "A quiz needs at least 1 question" : "Remove question"}
                                                className="grid size-8 place-items-center rounded-[9px] text-ink-muted transition hover:bg-danger-light hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>

                                        <label htmlFor={textId} className="sr-only">Question {qIndex + 1} text</label>
                                        <textarea
                                            id={textId}
                                            rows={2}
                                            placeholder="e.g. Which register holds the address of the next instruction to be executed?"
                                            value={question.text}
                                            onChange={(e) => handleQuestionText(qIndex, e.target.value)}
                                            aria-invalid={textError ? true : undefined}
                                            className={`${fieldClass(Boolean(textError))} min-h-[46px] resize-y`}
                                        />
                                        <FieldError message={textError} />

                                        <fieldset className="mt-3">
                                            <legend className="sr-only">Options for question {qIndex + 1}. Select the correct answer.</legend>
                                            <div className="grid gap-2.5 sm:grid-cols-2">
                                                {question.options.map((option, oIndex) => {
                                                    const isCorrect = question.correctIndex === oIndex
                                                    const optionError = errors[`questions[${qIndex}].options[${oIndex}]`]
                                                    const rowClass = optionError
                                                        ? "border-danger bg-canvas"
                                                        : isCorrect
                                                            ? "border-success bg-success-light"
                                                            : "border-line bg-canvas hover:border-line-strong"
                                                    return (
                                                        <div key={oIndex}>
                                                            <div className={`flex items-center gap-2.5 rounded-control border-[1.5px] px-3 py-2.5 transition ${rowClass}`}>
                                                                <label className="relative grid shrink-0 cursor-pointer place-items-center" title="Mark as correct answer">
                                                                    <input
                                                                        type="radio"
                                                                        name={`correct-${question.key}`}
                                                                        className="peer sr-only"
                                                                        checked={isCorrect}
                                                                        onChange={() => handleCorrectOption(qIndex, oIndex)}
                                                                        aria-label={`Mark option ${OPTION_LABELS[oIndex]} as correct`}
                                                                    />
                                                                    <span
                                                                        aria-hidden="true"
                                                                        className={`block size-4 rounded-full border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-success/25 ${isCorrect ? "border-success bg-success shadow-[inset_0_0_0_2px_#fff]" : "border-line-strong bg-canvas"}`}
                                                                    />
                                                                </label>
                                                                <input
                                                                    id={`question-${question.key}-option-${oIndex}`}
                                                                    aria-label={`Question ${qIndex + 1} option ${OPTION_LABELS[oIndex]}`}
                                                                    aria-invalid={optionError ? true : undefined}
                                                                    placeholder={`Option ${OPTION_LABELS[oIndex]}`}
                                                                    value={option}
                                                                    onChange={(e) => handleOptionText(qIndex, oIndex, e.target.value)}
                                                                    className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted/70"
                                                                />
                                                                {isCorrect && (
                                                                    <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wide text-success-dark">Correct</span>
                                                                )}
                                                            </div>
                                                            <FieldError message={optionError} />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            {correctError || optionsError ? (
                                                <FieldError message={correctError ?? optionsError} className="mt-2" />
                                            ) : question.correctIndex === null ? (
                                                <p className="mt-2 text-xs text-ink-muted">Click the circle next to the correct answer.</p>
                                            ) : null}
                                        </fieldset>
                                    </div>
                                )
                            })}

                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="flex w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-strong bg-canvas-soft p-7 text-sm font-bold text-ink-muted transition hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700"
                            >
                                <Plus className="size-4" aria-hidden="true" />
                                Add Question
                            </button>
                        </form>

                        {/* Summary + actions */}
                        <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-[260px]">
                            <div className="rounded-card bg-canvas p-5 shadow-card">
                                <h2 className="mb-4 text-sm font-extrabold text-ink">Quiz Summary</h2>
                                <dl className="space-y-2.5 text-[13px] text-ink-muted">
                                    <div className="flex justify-between gap-3">
                                        <dt>Questions</dt>
                                        <dd className="font-bold text-ink">{questionCount}</dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt>Total Points</dt>
                                        <dd className="font-bold text-ink">{questionCount}</dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt>To Pass</dt>
                                        <dd className="font-bold text-ink">
                                            {neededToPass} of {questionCount} correct
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt>Passing Score</dt>
                                        <dd className="font-bold text-ink">{Number.isFinite(scoreNumber) ? `${scoreNumber}%` : "—"}</dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt>Completed</dt>
                                        <dd className="font-bold text-ink">{completedQuestions} / {questionCount}</dd>
                                    </div>
                                </dl>

                                <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-4">
                                    {/* Create Quiz: only for a quiz that is not saved yet */}
                                    <button
                                        type="button"
                                        onClick={handleCreate}
                                        disabled={busy || isCreated}
                                        title={isCreated ? "This quiz is already created. Use Save Changes to update it." : undefined}
                                        className={`${isCreated ? outlineButtonClass : primaryButtonClass} w-full py-[11px] text-sm`}
                                    >
                                        <Plus className="size-4" aria-hidden="true" />
                                        {saving && !isCreated ? "Creating..." : "Create Quiz"}
                                    </button>

                                    {/* Save Changes: only once the quiz exists */}
                                    <button
                                        type="button"
                                        onClick={handleSaveChanges}
                                        disabled={busy || !isCreated}
                                        title={isCreated ? undefined : "Create the quiz first, then you can save changes to it."}
                                        className={`${isCreated ? primaryButtonClass : outlineButtonClass} w-full py-[11px] text-sm`}
                                    >
                                        <Save className="size-4" aria-hidden="true" />
                                        {saving && isCreated ? "Saving..." : "Save Changes"}
                                    </button>

                                    {isCreated && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={busy}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-control border border-line-strong bg-canvas py-[11px] text-sm font-bold text-danger transition hover:border-danger hover:bg-danger-light disabled:cursor-not-allowed disabled:opacity-55"
                                        >
                                            <Trash2 className="size-4" aria-hidden="true" />
                                            {deleting ? "Deleting..." : "Delete Quiz"}
                                        </button>
                                    )}
                                </div>
                                {!isCreated && (
                                    <p className="mt-3 text-xs leading-5 text-ink-muted">
                                        Save Changes becomes available after the quiz is created.
                                    </p>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </SiteChrome>
    )
}

export default QuizBuilderRoute
