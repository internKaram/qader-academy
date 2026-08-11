import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Card, Input, Badge } from "../components/ui"
import { useDraftState } from "../hooks/useDraftState"
import api from "../api/axios"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

// inside the return, right after <div className="page-container max-w-3xl">
<Link to="/catalog" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-brand-700">
    <ArrowLeft className="size-4" />
    Cancel and back to catalog
</Link>
interface CourseDraft {
    title: string
    description: string
    category: string
    price: string
    thumbnail: string
    isPublished: boolean

}

const emptyDraft: CourseDraft = {
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: "",
    isPublished: false,

}

const steps = ["Basics", "Details & Pricing", "Thumbnail", "Review"] as const

function CourseWizardPage() {
    const { courseId } = useParams<{ courseId?: string }>()
    const navigate = useNavigate()
    const isEditMode = Boolean(courseId)
    const storageKey = isEditMode ? `course-draft-${courseId}` : "course-draft-new"

    const { draft, setDraft, clearDraft } = useDraftState<CourseDraft>(storageKey, emptyDraft)
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState<boolean>(isEditMode)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isEditMode) return
        const fetchCourse = async () => {
            try {
                const response = await api.get(`/courses/${courseId}`)
                const c = response.data
                setDraft({
                    title: c.title,
                    description: c.description,
                    category: c.category,
                    price: String(c.price),
                    thumbnail: c.thumbnail ?? "",
                    isPublished: c.isPublished,
                })
            } catch {
                setError("Failed to load course for editing")
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId])

    function updateField<K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) {
        setDraft((prev) => ({ ...prev, [key]: value }))
    }

    function canProceed(): boolean {
        if (currentStep === 0) return draft.title.trim().length > 0
        if (currentStep === 1) return draft.description.trim().length > 0 && draft.category.trim().length > 0 && draft.price.trim().length > 0
        return true
    }

async function handlePublish() {
    setSubmitting(true)
    setError(null)

    try {
        const payload = {
            title: draft.title,
            description: draft.description,
            category: draft.category,
            price: Number(draft.price),
            thumbnail: draft.thumbnail,
            isPublished: true,
        }

        await api.patch(`/courses/${courseId}`, payload)

        clearDraft()
        navigate("/courses")
    } catch {
        setError("Failed to publish course. Please try again.")
    } finally {
        setSubmitting(false)
    }
}

 async function handleSubmit(isPublished: boolean) { // boolean set to true if "Publish Course" button is clicked, otherwise it will be a draft
    setSubmitting(true)
    setError(null)

    try {
        const payload = {
            title: draft.title,
            description: draft.description,
            category: draft.category,
            price: Number(draft.price),
            thumbnail: draft.thumbnail,
            isPublished: isPublished,
        }
    
        if (isEditMode) {
            await api.patch(`/courses/${courseId}`, payload)
        } else {
            await api.post("/courses", payload)
        }

        clearDraft()
        navigate("/catalog")
    } catch {
        setError("Failed to save course. Please check your fields and try again.")
    } finally {
        setSubmitting(false)
    }
}
    if (loading) {
        return <main className="grid min-h-screen place-items-center bg-canvas-soft">Loading...</main>
    }

    return (
        <main className="min-h-screen bg-canvas-soft py-10 text-ink">
            <div className="page-container max-w-3xl">
                <Link to="/catalog" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-brand-700">
                <ArrowLeft className="size-4" />
                Cancel and back to catalog
                </Link>
                <p className="eyebrow">{isEditMode ? "Edit course" : "New course"}</p>
                <h1 className="mt-3 font-display text-heading-lg">
                    {isEditMode ? "Update your course" : "Create a new course"}
                </h1>

                <div className="mt-6 flex gap-2">
                    {steps.map((label, index) => (
                        <Badge key={label} variant={index === currentStep ? "brand" : "neutral"}>
                            {index + 1}. {label}
                        </Badge>
                    ))}
                </div>

                <Card variant="surface" className="mt-6">
                    <Card.Body>
                        {error && <p className="mb-4 text-sm font-bold text-danger">{error}</p>}

                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <Input
                                    id="wizard-title"
                                    label="Course title"
                                    required
                                    hint="use a clear, specific name that tells students what they will learn"
                                    placeholder="e.g. Introduction to Web Development"
                                    value={draft.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                />
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <Input
                                    id="wizard-description"
                                    label="Description"
                                    multiline
                                    required
                                    hint="Briefly explain what this course offers and what students will gain from completing it."
                                    placeholder="Describe the main topics, skills, and outcomes students can expect..."
                                    value={draft.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                />
                                <Input
                                    id="wizard-category"
                                    label="Category"
                                    required
                                    hint="Choose the category that best describes the course"
                                    placeholder="e.g. Front-end, Back-end, AI"
                                    value={draft.category}
                                    onChange={(e) => updateField("category", e.target.value)}
                                />
                                <Input
                                    id="wizard-price"
                                    label="Price (SAR)"
                                    required
                                    type="number"
                                    value={draft.price}
                                    onChange={(e) => updateField("price", e.target.value)}
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <Input
                                    id="wizard-thumbnail"
                                    label="Thumbnail URL"
                                    optional
                                    placeholder="https://example.com/course-thumbnail.jpg"
                                    hint="Paste a link to an already-hosted image."
                                    value={draft.thumbnail}
                                    onChange={(e) => updateField("thumbnail", e.target.value)}
                                />
                                {draft.thumbnail && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-ink-soft">Preview</p>
                                        <img
                                            src={draft.thumbnail}
                                            alt="Thumbnail preview"
                                            className="h-40 rounded-control object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-3">
                                <p className="text-sm text-ink-soft">
                                    Review your course details before publishing. You can go back to any previous
                                    step to make changes.
                                </p>
                                <p><span className="font-bold">Title:</span> {draft.title}</p>
                                <p><span className="font-bold">Description:</span> {draft.description}</p>
                                <p><span className="font-bold">Category:</span> {draft.category}</p>
                                <p><span className="font-bold">Price:</span> {draft.price} SAR</p>
                            </div>
                        )}
                    </Card.Body>

                   <Card.Footer className="justify-between">
    <Button
        variant="outline"
        disabled={currentStep === 0}
        onClick={() => setCurrentStep((s) => s - 1)}
    >
        Back
    </Button>

    {currentStep < steps.length - 1 ? (
        <Button
            disabled={!canProceed()}
            onClick={() => setCurrentStep((s) => s + 1)}
        >
            Next
        </Button>
    ) : (
        <div className="flex gap-3">
            <Button
                variant="outline"
                loading={submitting}
                onClick={() => handleSubmit(false)}
            >
                {isEditMode ? "Save changes" : "Save as draft"}
            </Button>

            {(!isEditMode || !draft.isPublished) && (
                <Button
                    variant="create"
                    loading={submitting}
                    onClick={() => handleSubmit(true)}
                >
                    Publish course
                </Button>
            )}
        </div>
    )}
</Card.Footer>
                </Card>
            </div>
        </main>
    )
}

export default CourseWizardPage