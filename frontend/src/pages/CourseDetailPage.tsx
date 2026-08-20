import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Badge, Button, Card, Spinner } from "../components/ui"
import api from "../api/axios"
import type { CourseWithLessons } from "../types/course"
import { ArrowLeft } from "lucide-react"
import { Clock, BookOpen, Plus } from "lucide-react"
import { useAuth } from "../hooks/useAuth"

// Renders a lesson duration total as "1h 25m" / "45m" depending on size —
// avoids showing "85 min" for anything over an hour.
function formatDuration(totalMinutes: number): string {
    if (totalMinutes <= 0) return "0 min"
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours === 0) return `${minutes} min`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
}

function CourseDetailPage() {
    const { courseId } = useParams<{ courseId: string }>()
    const [course, setCourse] = useState<CourseWithLessons | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()


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
    const lessons = course.lessons ?? []
    const totalMinutes = lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0)

    return (
        <main className="min-h-screen bg-canvas-soft py-10 text-ink">
            <div className="page-container">
                <Link to="/catalog" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-brand-700">
                    <ArrowLeft className="size-4" />
                    Back to catalog
                </Link>
                <div className="overflow-hidden rounded-panel bg-canvas-dark text-white shadow-lift">
                    <div className="relative min-h-80 sm:min-h-96">
                        {course.thumbnail ? (
                            <img
                                className="absolute inset-0 h-full w-full object-cover"
                                src={course.thumbnail}
                                alt=""
                                aria-hidden="true"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-linear-to-br from-brand-600 via-brand-500 to-[#f7b2a6]" />
                        )}
                        {/* Overlay only at the bottom, so the thumbnail is visible across
                            most of the banner instead of being washed out edge to edge. */}
                        <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-8">
                            <Badge variant="outline" className="!bg-white/90 !text-ink">
                                {course.category}
                            </Badge>
                            <h1 className="mt-4 font-display text-display-md">{course.title}</h1>
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-semibold text-white/85">
                                <span className="flex items-center gap-1.5">
                                    <BookOpen className="size-4" />
                                    {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="size-4" />
                                    {formatDuration(totalMinutes)} total
                                </span>
                            </div>
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
                        <ul className="mt-4 space-y-3">
                                {lessons.map((lesson) => (
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
                    </div>

                    <Card variant="elevated" className="h-fit">
                        <Card.Header>
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Price</p>
                            <p className="font-display text-3xl font-black text-ink">{course.price} SAR</p>
                        </Card.Header>
                        <Card.Body>
                            <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                                <BookOpen className="size-4" />
                                {lessons.length} Lesson(s)
                            </p>
                            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
                                <Clock className="size-4" />
                                {formatDuration(totalMinutes)} total
                            </p>
                        </Card.Body>
                        <Card.Footer>
                            <Button fullWidth>Enroll (coming soon)</Button>
                        </Card.Footer>
                    </Card>
                </div>
            </div>
        </main>
    )
}

export default CourseDetailPage