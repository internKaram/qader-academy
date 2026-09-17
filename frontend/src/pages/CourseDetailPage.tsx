import { useEffect, useState } from "react"
import { useParams, Link, useLocation, useNavigate } from "react-router-dom"
import { Badge, Button, Card, Spinner } from "../components/ui"
import api from "../api/axios"
import type { CourseWithLessons } from "../types/course"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Clock, BookOpen, Plus } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { enrollInCourse, isEnrolledInCourse } from "../services/enrollmentService"
import { StudentCourseQuizzes } from "../components/quiz/StudentCourseQuizzes"


function CourseDetailPage() {
    const { courseId } = useParams<{ courseId: string }>()
    const [course, setCourse] = useState<CourseWithLessons | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const { user, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Enrollment state (only used for student accounts)
    const [isEnrolled, setIsEnrolled] = useState<boolean>(false)
    const [checkingEnrollment, setCheckingEnrollment] = useState<boolean>(true)
    const [enrolling, setEnrolling] = useState<boolean>(false)
    const [enrollError, setEnrollError] = useState<string | null>(null)

    // When a student opens the page, check whether they are already enrolled
    useEffect(() => {
        if (authLoading) return
        if (!courseId || user?.role !== "student") {
            setCheckingEnrollment(false)
            return
        }
        let cancelled = false
        const checkEnrollment = async () => {
            try {
                const enrolled = await isEnrolledInCourse(courseId)
                if (!cancelled) setIsEnrolled(enrolled)
            } catch {
                // If the check fails, still show the Enroll button; enrolling handles duplicates
            } finally {
                if (!cancelled) setCheckingEnrollment(false)
            }
        }
        checkEnrollment()
        return () => {
            cancelled = true
        }
    }, [courseId, user, authLoading])

    async function handleEnroll() {
        if (!courseId) return

        // Logged out: send them to login, then bring them back to this course
        if (!user) {
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
            return
        }

        setEnrolling(true)
        setEnrollError(null)
        try {
            await enrollInCourse(courseId)
            setIsEnrolled(true)
        } catch {
            // The API answers 400 if they were already enrolled (e.g. from another tab).
            // Re-check instead of showing an error in that case.
            try {
                if (await isEnrolledInCourse(courseId)) {
                    setIsEnrolled(true)
                    return
                }
            } catch {
                // fall through to the error message
            }
            setEnrollError("Could not enroll you in this course. Please try again.")
        } finally {
            setEnrolling(false)
        }
    }

    useEffect(() => {
        if (!courseId) return
        const fetchCourse = async () => {
            try {
                const response = await api.get<CourseWithLessons>(`/courses/${courseId}`)
                setCourse(response.data)
            } catch (err) {
                setError("Failed to load course")
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
    }, [courseId])


    
    if (loading) {
        return (
            <main className="grid min-h-screen place-items-center bg-canvas-soft">
                <Spinner size="lg" label="Loading course" />
            </main>
        )
    }

    if (error || !course) {
        return (
            <main className="grid min-h-screen place-items-center bg-canvas-soft p-8 text-center">
                <div>
                    <h1 className="font-display text-heading-sm text-ink">{error ?? "Course not found"}</h1>
                    <Link to="/catalog" className="mt-4 inline-block">
                        <Button variant="outline">Back to catalog</Button>
                    </Link>
                </div>
            </main>
        )
    }

    const isOwner = user?.id === course.instructorId

    return (
        <main className="min-h-screen bg-canvas-soft py-10 text-ink">
            <div className="page-container">
                <Link to="/catalog" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-brand-700">
                    <ArrowLeft className="size-4" />
                    Back to catalog
                </Link>
                <div className="overflow-hidden rounded-panel bg-canvas-dark text-white shadow-lift">
                    <div className="relative min-h-56 bg-linear-to-br from-brand-600 via-brand-500 to-[#f7b2a6] p-8">
                        {course.thumbnail ? (
                            <img
                                className="absolute inset-0 h-full w-full object-cover"
                                src={course.thumbnail}
                                alt=""
                                aria-hidden="true"
                            />
                        ) : null}
                        <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/30 to-ink/10" />
                        <div className="relative">
                            <Badge variant="outline" className="!bg-white/90 !text-ink">
                                {course.category}
                            </Badge>
                            <h1 className="mt-6 font-display text-display-md">{course.title}</h1>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
                    <div>
                        <h2 className="font-display text-heading-sm text-ink">About this course</h2>
                        <p className="mt-4 body-copy">{course.description}</p>

                        <div className="mt-10 flex items-center justify-between">
                            <h2 className="font-display text-heading-sm text-ink">Lessons</h2>
                            {isOwner && (
                                <Link to={`/instructor/courses/${course._id}/lessons`}>
                                    <Button className="addLesson-buttonTitle"size="sm" variant="outline" title="Add Lesson">
                                        <Plus className="size-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                        {(course.lessons ?? []).length === 0 && (
                            <div className="mt-4 rounded-card border border-dashed border-line-strong bg-canvas p-8 text-center">
                                <BookOpen className="mx-auto size-6 text-ink-muted" />
                                <p className="mt-3 font-bold text-ink">There are no lessons in this course yet.</p>
                                <p className="mt-1 text-sm text-ink-soft">
                                    {isOwner ? "Use the + button above to add the first lesson." : "Check back soon, new lessons will appear here."}
                                </p>
                            </div>
                        )}
                        <ul className="mt-4 space-y-3">
                                {(course.lessons ?? []).map((lesson) => (
                                <li
                                    key={lesson._id}
                                    className="flex items-center justify-between rounded-control border border-line bg-canvas p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-xs font-black text-brand-600">
                                            {lesson.orderIndex}
                                        </span>
                                        <p className="font-bold text-ink">{lesson.title}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-sm text-ink-soft">
                                            <Clock className="size-4" />
                                            {lesson.duration} min
                                        </span>
                                    
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {user?.role === "student" && isEnrolled && courseId && (
                            <StudentCourseQuizzes courseId={courseId} />
                        )}
                    </div>

                    <Card variant="elevated" className="h-fit">
                        <Card.Header>
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Price</p>
                            <p className="font-display text-3xl font-black text-ink">{course.price} SAR</p>
                        </Card.Header>
                        <Card.Body>
                            <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                                <BookOpen className="size-4" />
                                {(course.lessons ?? []).length} Lesson(s) 
                            </p>
                        </Card.Body>
                        <Card.Footer>
                            <div className="flex w-full flex-col gap-2">
                            {authLoading || (user?.role === "student" && checkingEnrollment) ? (
                                <Button fullWidth loading>
                                    Enroll now
                                </Button>
                            ) : !user ? (
                                <>
                                    <Button fullWidth onClick={handleEnroll}>
                                        Enroll now
                                    </Button>
                                    <p className="text-center text-xs text-ink-muted">You'll be asked to log in first.</p>
                                </>
                            ) : isOwner ? (
                                <>
                                    <p className="text-center text-sm font-semibold text-ink-soft">You are the instructor of this course.</p>
                                    <Link to={`/instructor/courses/${course._id}/quizzes?tab=students`}>
                                        <Button fullWidth variant="outline">Students & quiz grades</Button>
                                    </Link>
                                </>
                            ) : user.role !== "student" ? (
                                <p className="text-center text-sm font-semibold text-ink-soft">Only student accounts can enroll.</p>
                            ) : isEnrolled ? (
                                <div className="flex items-center justify-center gap-2 rounded-control bg-success-light px-4 py-3 text-sm font-bold text-success-dark">
                                    <CheckCircle2 className="size-4" />
                                    You're enrolled in this course
                                </div>
                            ) : (
                                <>
                                    <Button fullWidth loading={enrolling} onClick={handleEnroll}>
                                        Enroll now
                                    </Button>
                                    {enrollError && (
                                        <p role="alert" className="text-center text-sm font-semibold text-danger">
                                            {enrollError}
                                        </p>
                                    )}
                                </>
                            )}
                            </div>
                        </Card.Footer>
                    </Card>
                </div>
            </div>
        </main>
    )
}

export default CourseDetailPage