import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { SiteChrome } from "../components/SiteChrome"
import { Badge, Button, Card, Spinner } from "../components/ui"
import api from "../api/axios"
import { useAuth } from "../hooks/useAuth"
import type { Course } from "../types/course"
import { Pen, Trash2 } from "lucide-react"
import { Plus } from 'lucide-react';



interface PaginationMeta {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
}

interface PaginatedCoursesResponse {
    courses: Course[]
    pagination: PaginationMeta
}

const PAGE_SIZE = 12

// Custom rotating-glow keyframe for the course card hover effect.
// Defined locally (rendered once via <style> below) so it doesn't depend
// on any animation utilities already being present in the compiled CSS.
const glowBorderStyles = `
@keyframes catalog-card-glow-spin {
  to { transform: rotate(1turn); }
}
`

// =============================================================================
// FEATURE TOGGLE: Dynamic thumbnail-based glow color
// =============================================================================
// When true, each card's hover glow is tinted to roughly match its thumbnail's
// dominant color (extracted via canvas pixel sampling). When false (or if
// extraction fails/is unsupported for a given image), every card falls back
// to the static brand-red glow.
//
// TO DISABLE THIS FEATURE ENTIRELY: just flip this to `false`. No other
// changes needed — the whole extraction pipeline below becomes inert and
// every card uses DEFAULT_GLOW_COLOR instead.
const ENABLE_DYNAMIC_GLOW_COLOR = true

const DEFAULT_GLOW_COLOR = "var(--color-brand-600, #d7263d)"

// --- FEATURE: DYNAMIC THUMBNAIL GLOW COLOR — helper start ---------------------
// Extracts an approximate dominant color from an image URL by averaging
// pixel RGB values on a small offscreen canvas. Resolves to null if the
// image's host doesn't allow cross-origin pixel reads (canvas gets "tainted"
// by CORS), if the image fails to load, or if every pixel got filtered out —
// callers should treat null as "use the default color instead."
//
// Safe to delete this whole function (and its call site below) if the
// feature is being removed rather than just toggled off.
function extractDominantColor(imageUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas")
                const size = 40
                canvas.width = size
                canvas.height = size
                const ctx = canvas.getContext("2d")
                if (!ctx) return resolve(null)

                ctx.drawImage(img, 0, 0, size, size)
                const { data } = ctx.getImageData(0, 0, size, size)

                let r = 0, g = 0, b = 0, count = 0
                for (let i = 0; i < data.length; i += 4) {
                    const pr = data[i]
                    const pg = data[i + 1]
                    const pb = data[i + 2]
                    const brightness = (pr + pg + pb) / 3
                    // Skip near-white and near-black pixels so a plain
                    // background doesn't dominate the average.
                    if (brightness < 20 || brightness > 235) continue
                    r += pr; g += pg; b += pb; count++
                }

                if (count === 0) return resolve(null)
                resolve(`rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`)
            } catch {
                // Tainted canvas (CORS) or other failure — caller falls back.
                resolve(null)
            }
        }
        img.onerror = () => resolve(null)
        img.src = imageUrl
    })
}
// --- FEATURE: DYNAMIC THUMBNAIL GLOW COLOR — helper end -----------------------

function CatalogPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [drafts, setDrafts] = useState<Course[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // --- FEATURE: DYNAMIC THUMBNAIL GLOW COLOR — state + effect start ---------
    // Maps courseId -> extracted "rgb(...)" string. Empty/missing entries
    // just mean "not extracted yet" or "extraction failed" — both fall back
    // to DEFAULT_GLOW_COLOR at render time, so this is safe to leave in
    // even if ENABLE_DYNAMIC_GLOW_COLOR is false (the effect below no-ops).
    const [glowColors, setGlowColors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (!ENABLE_DYNAMIC_GLOW_COLOR) return
        const allVisible = [...courses, ...drafts]
        allVisible.forEach((course) => {
            if (!course.thumbnail || glowColors[course._id]) return
            extractDominantColor(course.thumbnail).then((color) => {
                if (color) {
                    setGlowColors((prev) => ({ ...prev, [course._id]: color }))
                }
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courses, drafts])
    // --- FEATURE: DYNAMIC THUMBNAIL GLOW COLOR — state + effect end -----------


    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true)
            setError(null)
            try {
                // Public list — always fetched, works for logged-out visitors too.
                // Paginated: { courses: [...], pagination: {...} }
                const publicResponse = await api.get<PaginatedCoursesResponse>("/courses", {
                    params: { page, limit: PAGE_SIZE },
                })
                setCourses(publicResponse.data.courses)
                setTotalPages(publicResponse.data.pagination.totalPages)

                // Instructors/admins also see their own drafts — shown in a separate
                // section below, NOT merged into the paginated public grid, since
                // /courses/mine isn't paginated and mixing the two breaks page-size math.
                if (user?.role === "instructor" || user?.role === "admin") {
                    const mineResponse = await api.get<Course[]>("/courses/mine")
                    const ownDrafts = mineResponse.data.filter((c) => !c.isPublished)
                    setDrafts(ownDrafts)
                } else {
                    setDrafts([])
                }
            } catch (err) {
                setError("Failed to load courses")
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [user, page])


    async function handleDeleteCourse(courseId: string) {
        if (!window.confirm("Delete this course and all its lessons? This cannot be undone.")) return
        try {
            await api.delete(`/courses/${courseId}`)
            setCourses((prev) => prev.filter((c) => c._id !== courseId))
            setDrafts((prev) => prev.filter((c) => c._id !== courseId))
        } catch {
            setError("Failed to delete course. Please try again.")
        }
    }

    function renderCourseCard(course: Course) {
        const isOwner = user?.id === course.instructorId

        // Resolves to the extracted color when the feature is on AND
        // extraction succeeded for this course; otherwise the default.
        const glowColor =
            ENABLE_DYNAMIC_GLOW_COLOR && glowColors[course._id]
                ? glowColors[course._id]
                : DEFAULT_GLOW_COLOR

        return (
            <div key={course._id} className="group relative overflow-hidden rounded-card p-px">
                {/* Rotating conic gradient — hidden until hover, sits behind the card */}
                <div
                    className="pointer-events-none absolute inset-[-100%] rounded-card opacity-0 transition-opacity duration-300 group-hover:opacity-100 [animation:catalog-card-glow-spin_3s_linear_infinite]"
                    style={{
                        backgroundImage: `conic-gradient(from 0deg, transparent 0deg, ${glowColor} 60deg, transparent 140deg)`,
                    }}
                />

                <Card
                    variant="surface"
                    interactive
                    className="relative flex h-full flex-col overflow-hidden bg-canvas"
                >
                    <div className="relative mb-4 aspect-video w-full overflow-hidden bg-canvas-warm">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt=""
                                aria-hidden="true"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-linear-to-br from-brand-600 via-brand-500 to-[#f7b2a6]" />
                        )}
                        {/* Soft vignette so the thumbnail's edges feel blended
                            into the card rather than hard-cropped. */}
                        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_28px_10px_rgba(18,24,38,0.18)]" />
                        {/* Fades the top edge into the card. */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-linear-to-b from-canvas to-transparent" />
                        {/* Fades the bottom edge into the card body below it. */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-linear-to-t from-canvas to-transparent" />
                    </div>
                    <Card.Header>
                        <div className="flex items-center justify-between gap-2">
                            <Badge variant="neutral">{course.category}</Badge>
                            <div className="flex gap-2">
                                {!course.isPublished ? (
                                    <Badge variant="warning">Draft</Badge>
                                ) : isOwner ? (
                                    <Badge variant="info">Published</Badge>
                                ) : null}
                            </div>
                        </div>
                        <h3 className="font-display text-heading-sm text-ink">{course.title}</h3>
                    </Card.Header>
                    <Card.Body>
                        <p className="line-clamp-3 text-sm leading-6 text-ink-soft">
                            {course.description}
                        </p>
                    </Card.Body>
                    <Card.Footer className="mt-auto flex-wrap items-center justify-between gap-2">
                        <p className="font-display text-xl font-black text-ink">
                            {course.price === 0 ? (
                                <Badge variant="free">FREE</Badge>
                            ) : (
                                <p className="font-display text-xl font-black text-ink">
                                    {course.price} SAR
                                </p>
                            )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {isOwner && (
                                <>
                                    <Link to={`/instructor/courses/${course._id}/edit`}>
                                        <Button className="addLesson-buttonTitle" size="sm" variant="outline" title="Edit course">
                                            <Pen className="size-4" />
                                        </Button>
                                    </Link>
                                    <Link to={`/instructor/courses/${course._id}/lessons`}>
                                        <Button className="addLesson-buttonTitle" size="sm" variant="outline" title="Add Lesson">
                                            <Plus className="size-4" />
                                        </Button>
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
                            <Link to={`/instructor/courses/${course._id}`}>
                                <Button size="sm" variant="outline">View course</Button>
                            </Link>
                        </div>
                    </Card.Footer>
                </Card>
            </div>
        )
    }


    return (
        <SiteChrome>
            <style>{glowBorderStyles}</style>
            <main className="min-h-screen pt-28 pb-16">
            <div className="page-container">
                <div className="max-w-2xl">
                    <p className="eyebrow">Catalog</p>
                    <h1 className="mt-3 font-display text-heading-lg">Browse all courses.</h1>
                    <p className="mt-4 body-copy">Explore every published course on QaderAcademy.</p>
                </div>
                        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end" data-animate-item>
                            {(user?.role === "instructor" || user?.role === "admin") && (

                        <Link to="/instructor/courses/new">
                            <Button size="lg" variant="create" >
                            Create a course
                            </Button>
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
                ) : (
                    <>
                        {drafts.length > 0 && (
                            <div className="mt-10">
                                <h2 className="font-display text-heading-sm text-ink">Your drafts</h2>
                                <p className="mt-1 text-sm text-ink-soft">
                                    Unpublished courses only visible to you.
                                </p>
                                <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {drafts.map(renderCourseCard)}
                                </div>
                            </div>
                        )}

                        <div className="mt-10">
                            {drafts.length > 0 && (
                                <h2 className="font-display text-heading-sm text-ink mb-4">Published courses</h2>
                            )}

                            {courses.length === 0 ? (
                                <div className="rounded-card border border-dashed border-line-strong bg-canvas-soft p-8 text-center">
                                    <h3 className="font-display text-heading-sm">No courses yet.</h3>
                                    <p className="mt-2 text-ink-soft">Published courses will appear here once available.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                        {courses.map(renderCourseCard)}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="mt-10 flex items-center justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page <= 1}
                                                onClick={() => setPage((p) => p - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <span className="text-sm font-semibold text-ink-soft">
                                                Page {page} of {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page >= totalPages}
                                                onClick={() => setPage((p) => p + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
            </main>
            
        </SiteChrome>
    )
}

export default CatalogPage