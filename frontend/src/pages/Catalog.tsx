import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { SiteFooter, SiteHeader } from "../components/SiteChrome"
import { Badge, Button, Card, Spinner } from "../components/ui"
import api from "../api/axios"
import type { Course } from "../types/course"

function CatalogPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get<Course[]>("/courses")
                setCourses(response.data)
            } catch {
                setError("Failed to load courses")
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [])

    return (
        <div className="min-h-screen bg-canvas-soft text-ink">
            <SiteHeader />
            <main className="min-h-screen pt-28 pb-16">
            <div className="page-container">
                <div className="max-w-2xl">
                    <p className="eyebrow">Catalog</p>
                    <h1 className="mt-3 font-display text-heading-lg">Browse all courses.</h1>
                    <p className="mt-4 body-copy">Explore every published course on QaderAcademy.</p>
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
                        {courses.map((course) => (
                            <Card key={course._id} variant="surface" interactive className="flex h-full flex-col">
                                <Card.Header>
                                    <Badge variant="neutral">{course.category}</Badge>
                                    <h3 className="font-display text-heading-sm text-ink">{course.title}</h3>
                                </Card.Header>
                                <Card.Body>
                                    <p className="line-clamp-3 text-sm leading-6 text-ink-soft">
                                        {course.description}
                                    </p>
                                </Card.Body>
                                <Card.Footer className="mt-auto items-center justify-between">
                                    <p className="font-display text-xl font-black text-ink">{course.price} SAR</p>
                                    <Link to={`/courses/${course._id}`}>
                                        <Button size="sm" variant="outline">
                                            View course
                                        </Button>
                                    </Link>
                                </Card.Footer>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            </main>
            <SiteFooter sectionBasePath="/" />
        </div>
    )
}

export default CatalogPage
