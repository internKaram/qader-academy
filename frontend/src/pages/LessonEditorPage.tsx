import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, GripVertical, Trash2 } from "lucide-react"
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button, Card, Input, Spinner } from "../components/ui"
import { useAuth } from "../hooks/useAuth"
import api from "../api/axios"
import type { Lesson, CourseWithLessons } from "../types/course"
import { extractFieldErrors, isFieldValidationError } from "../api/apiErrors"

interface LessonRowProps {
    lesson: Lesson
    onSave: (lessonId: string, updates: Partial<Lesson>) => Promise<void>
    onDelete: (lessonId: string) => void
}

function SortableLessonRow({ lesson, onSave, onDelete }: LessonRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson._id })
    const [title, setTitle] = useState(lesson.title)
    const [contentUrl, setContentUrl] = useState(lesson.contentUrl)
    const [duration, setDuration] = useState(String(lesson.duration))
    const [saving, setSaving] = useState(false)
    const [dirty, setDirty] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    function markDirty() {
        setDirty(true)
    }

    function clearFieldError(field: string) {
        if (!fieldErrors[field]) return
        setFieldErrors((prev) => {
            const next = { ...prev }
            delete next[field]
            return next
        })
    }

    async function handleSave() {
        setSaving(true)
        setFieldErrors({})
        try {
            await onSave(lesson._id, { title, contentUrl, duration: Number(duration) })
            setDirty(false)
        } catch (err) {
            if (isFieldValidationError(err)) {
                setFieldErrors(extractFieldErrors(err))
            }
            // non-validation failures are left to the caller/global handling;
            // dirty stays true so the user's edits aren't lost
        } finally {
            setSaving(false)
        }
    }

    return (
        <div ref={setNodeRef} style={style} className="rounded-control border border-line bg-canvas p-4">
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="mt-2 cursor-grab text-ink-muted active:cursor-grabbing"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="size-5" />
                </button>

                <div className="grid flex-1 gap-3 sm:grid-cols-[2fr_2fr_1fr]">
                    <Input
                        id={`title-${lesson._id}`}
                        label="Lesson title"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); markDirty(); clearFieldError("title") }}
                        error={fieldErrors.title}
                    />
                    <Input
                        id={`url-${lesson._id}`}
                        label="Content URL"
                        value={contentUrl}
                        onChange={(e) => { setContentUrl(e.target.value); markDirty(); clearFieldError("contentUrl") }}
                        error={fieldErrors.contentUrl}
                    />
                    <Input
                        id={`duration-${lesson._id}`}
                        label="Duration (min)"
                        type="number"
                        value={duration}
                        onChange={(e) => { setDuration(e.target.value); markDirty(); clearFieldError("duration") }}
                        error={fieldErrors.duration}
                    />
                </div>

                <div className="mt-6 flex gap-2">
                    <Button size="sm" disabled={!dirty} loading={saving} onClick={handleSave}>
                        Save
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Delete lesson"
                        onClick={() => onDelete(lesson._id)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function LessonEditorPage() {
    const { courseId } = useParams<{ courseId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [lessons, setLessons] = useState<Lesson[]>([])
    const [courseTitle, setCourseTitle] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [newTitle, setNewTitle] = useState("")
    const [newContentUrl, setNewContentUrl] = useState("")
    const [newDuration, setNewDuration] = useState("")
    const [creating, setCreating] = useState(false)
    const [newLessonErrors, setNewLessonErrors] = useState<Record<string, string>>({})

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

    useEffect(() => {
        if (!courseId) return
        const fetchData = async () => {
            try {
                const response = await api.get<CourseWithLessons>(`/courses/${courseId}`)
                if (user && user.id !== response.data.instructorId) {
                    setError("You are not authorized to edit lessons for this course.")
                    setLoading(false)
                    return
                }
                setCourseTitle(response.data.title)
                setLessons([...response.data.lessons].sort((a, b) => a.orderIndex - b.orderIndex))
            } catch {
                setError("Failed to load course.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [courseId, user])

    async function handleSaveLesson(lessonId: string, updates: Partial<Lesson>) {
        const response = await api.patch<Lesson>(`/courses/${courseId}/lessons/${lessonId}`, updates)
        setLessons((prev) => prev.map((l) => (l._id === lessonId ? response.data : l)))
    }

    async function handleDeleteLesson(lessonId: string) {
        if (!window.confirm("Delete this lesson? This cannot be undone.")) return
        await api.delete(`/courses/${courseId}/lessons/${lessonId}`)
        setLessons((prev) => prev.filter((l) => l._id !== lessonId))
    }

    function clearNewLessonError(field: string) {
        if (!newLessonErrors[field]) return
        setNewLessonErrors((prev) => {
            const next = { ...prev }
            delete next[field]
            return next
        })
    }

    async function handleCreateLesson() {
        if (!newTitle.trim() || !newContentUrl.trim() || !newDuration.trim()) return
        setCreating(true)
        setNewLessonErrors({})
        try {
            const nextOrderIndex = lessons.length > 0 ? Math.max(...lessons.map((l) => l.orderIndex)) + 1 : 1
            await api.post(`/courses/${courseId}/lessons`, {
                title: newTitle,
                contentUrl: newContentUrl,
                duration: Number(newDuration),
                orderIndex: nextOrderIndex,
            })
            const response = await api.get<CourseWithLessons>(`/courses/${courseId}`)
            setLessons([...response.data.lessons].sort((a, b) => a.orderIndex - b.orderIndex))
            setNewTitle("")
            setNewContentUrl("")
            setNewDuration("")
        } catch (err) {
            if (isFieldValidationError(err)) {
                setNewLessonErrors(extractFieldErrors(err))
            } else {
                setError("Failed to add lesson. Please try again.")
            }
        } finally {
            setCreating(false)
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = lessons.findIndex((l) => l._id === active.id)
        const newIndex = lessons.findIndex((l) => l._id === over.id)
        const reordered = arrayMove(lessons, oldIndex, newIndex)

        // Snapshot the pre-drag order so we can restore it if the save fails
        const previousLessons = lessons
        setLessons(reordered) // optimistic update — UI reflects the new order immediately

        const payload = reordered.map((lesson, index) => ({
            lessonId: lesson._id,
            orderIndex: index + 1,
        }))

        try {
            await api.patch(`/courses/${courseId}/lessons/reorder`, { lessons: payload })
        } catch (err) {
            // Roll back rather than leaving the UI showing an order that was never actually saved
            setLessons(previousLessons)

            // Reorder errors are array-indexed (e.g. "lessons[0].lessonId") rather than
            // tied to a single visible input, so there's no field to attach them to —
            // show the messages directly instead of trying to map them onto a row.
            if (isFieldValidationError(err)) {
                const messages = Object.values(extractFieldErrors(err))
                setError(messages.length > 0 ? messages.join(" ") : "Failed to save new order. Your previous order has been restored.")
            } else {
                setError("Failed to save new order. Your previous order has been restored.")
            }
        }
    }

    if (loading) {
        return <main className="grid min-h-screen place-items-center bg-canvas-soft"><Spinner size="lg" label="Loading lessons" /></main>
    }

    if (error) {
        return (
            <main className="grid min-h-screen place-items-center bg-canvas-soft p-8 text-center">
                <div>
                    <p className="text-ink-soft">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/courses")}>
                        Back to catalog
                    </Button>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-canvas-soft py-10 text-ink">
            <div className="page-container max-w-3xl">
                <Link to={`/instructor/courses/${courseId}`} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-brand-700">
                    <ArrowLeft className="size-4" />
                    Back to course
                </Link>

                <p className="eyebrow">Lesson editor</p>
                <h1 className="mt-3 font-display text-heading-lg">{courseTitle}</h1>
                <p className="mt-2 text-ink-soft">Drag lessons to reorder. Edit fields and click Save to update.</p>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={lessons.map((l) => l._id)} strategy={verticalListSortingStrategy}>
                        <div className="mt-6 space-y-3">
                            {lessons.map((lesson) => (
                                <SortableLessonRow
                                    key={lesson._id}
                                    lesson={lesson}
                                    onSave={handleSaveLesson}
                                    onDelete={handleDeleteLesson}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <Card variant="soft" className="mt-12">
                    <Card.Header>
                        <h3 className="font-display text-heading-sm">Add a new lesson</h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr]">
                            <Input
                                id="new-title"
                                label="Lesson title"
                                hint="Give the lesson a short, descriptive name."
                                placeholder="e.g. Setting up your development environment"
                                value={newTitle}
                                onChange={(e) => { setNewTitle(e.target.value); clearNewLessonError("title") }}
                                error={newLessonErrors.title}
                            />

                            <Input
                                id="new-url"
                                label="Content URL"
                                hint="Paste the link students should use to access this lesson's content."
                                placeholder="https://..."
                                value={newContentUrl}
                                onChange={(e) => { setNewContentUrl(e.target.value); clearNewLessonError("contentUrl") }}
                                error={newLessonErrors.contentUrl}
                            />

                            <Input
                                id="new-duration"
                                label="Duration (min)"
                                type="number"
                                hint="Enter the estimated number of minutes students need to complete this lesson."
                                placeholder="e.g. 20"
                                value={newDuration}
                                onChange={(e) => { setNewDuration(e.target.value); clearNewLessonError("duration") }}
                                error={newLessonErrors.duration}
                            />
                        </div>
                    </Card.Body>
                    <Card.Footer>
                        <Button loading={creating} onClick={handleCreateLesson}>Add lesson</Button>
                    </Card.Footer>
                </Card>
            </div>
        </main>
    )
}

export default LessonEditorPage