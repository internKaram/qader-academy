import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Badge, Button, Card, Spinner } from "../components/ui"
import api from "../api/axios"
import { useAuth } from "../hooks/useAuth"
import type { Course } from "../types/course"
import { ArrowLeft } from "lucide-react"
import { Trash2 } from "lucide-react"

function CatalogPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()
    const canCreateCourses = user?.role === "instructor" || user?.role === "admin"

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get<Course[]>("/courses")
                setCourses(response.data)
            } catch (err) {
                setError("Failed to load courses")
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [])


    async function handleDeleteCourse(courseId: string) {
    if (!window.confirm("Delete this course and all its lessons? This cannot be undone.")) return
    try {
        await api.delete(`/courses/${courseId}`)
        setCourses((prev) => prev.filter((c) => c._id !== courseId))
    } catch {
        setError("Failed to delete course. Please try again.")
    }
}


    return (
        <main className="min-h-screen bg-canvas-soft py-10 text-ink">
            <div className="page-container">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="eyebrow">Catalog</p>
                        <h1 className="mt-3 font-display text-heading-lg">Browse all courses.</h1>
                        <p className="mt-4 body-copy">Explore every published course on QaderAcademy.</p>
                    </div>
                    {canCreateCourses && (
                        <Link to="/instructor/courses/new">
                            <Button>Create new course</Button>
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="mt-10 flex justify-center">
                        <Spinner size="lg" label="Loading courses" />
                    </div>
                ) : error ? (
                    <div className="mt-10 rounded-card border border-dashed border-line-strong bg-canvas p-8 text-center">
                        <p className="text-ink-soft">{error}</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="mt-10 rounded-card border border-dashed border-line-strong bg-canvas-soft p-8 text-center">
                        <h3 className="font-display text-heading-sm">No courses yet.</h3>
                        <p className="mt-2 text-ink-soft">Published courses will appear here once available.</p>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {courses.map((course) => {
                            const isOwner = user?.id === course.instructorId
                            return (
                                <Card key={course._id} variant="surface" interactive className="flex h-full flex-col">
                                    <Card.Header>
                                        <div className="flex items-center justify-between gap-2">
                                            <Badge variant="neutral">{course.category}</Badge>
                                            {isOwner && <Badge variant="brand">Your course</Badge>}
                                        </div>
                                        <h3 className="font-display text-heading-sm text-ink">{course.title}</h3>
                                    </Card.Header>
                                    <Card.Body>
                                        <p className="line-clamp-3 text-sm leading-6 text-ink-soft">
                                            {course.description}
                                        </p>
                                    </Card.Body>
                                    <Card.Footer className="mt-auto flex-wrap items-center justify-between gap-2">
                                        <p className="font-display text-xl font-black text-ink">{course.price} SAR</p>
                                        <div className="flex flex-wrap gap-2">
                                            {isOwner && (
                                                <>
                                                    <Link to={`/instructor/courses/${course._id}/edit`}>
                                                        <Button size="sm" variant="ghost">Edit</Button>
                                                    </Link>
                                                    <Link to={`/instructor/courses/${course._id}/lessons`}>
                                                        <Button size="sm" variant="ghost">Add lessons</Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        aria-label={`Delete ${course.title}`}
                                                        onClick={() => handleDeleteCourse(course._id)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Link to={`/courses/${course._id}`}>
                                                <Button size="sm" variant="outline">View course</Button>
                                            </Link>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    )
}

export default CatalogPage