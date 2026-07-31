import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Card, Input, Badge } from "../components/ui"
import { useDraftState } from "../hooks/useDraftState"
import api from "../api/axios"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

// inside the return, right after <div className="page-container max-w-3xl">
<Link to="/courses" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-brand-700">
    <ArrowLeft className="size-4" />
    Cancel and back to catalog
</Link>
interface CourseDraft {
    title: string
    description: string
    category: string
    price: string
    thumbnail: string
}

const emptyDraft: CourseDraft = {
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: "",
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

    async function handleSubmit() {
        setSubmitting(true)
        setError(null)
        try {
            const payload = {
                title: draft.title,
                description: draft.description,
                category: draft.category,
                price: Number(draft.price),
                thumbnail: draft.thumbnail,
            }
            if (isEditMode) {
                await api.patch(`/courses/${courseId}`, payload)
            } else {
                await api.post("/courses", payload)
            }
            clearDraft()
            navigate("/courses")
        } catch (err) {
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
                <Link to="/courses" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink-soft transition hover:text-brand-700">
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
                                    value={draft.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                />
                                <Input
                                    id="wizard-category"
                                    label="Category"
                                    required
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
                                    hint="Paste a link to an already-hosted image."
                                    value={draft.thumbnail}
                                    onChange={(e) => updateField("thumbnail", e.target.value)}
                                />
                                {draft.thumbnail && (
                                    <img src={draft.thumbnail} alt="Thumbnail preview" className="h-40 rounded-control object-cover" />
                                )}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-3">
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
                            <Button disabled={!canProceed()} onClick={() => setCurrentStep((s) => s + 1)}>
                                Next
                            </Button>
                        ) : (
                            <Button loading={submitting} onClick={handleSubmit}>
                                {isEditMode ? "Save changes" : "Publish course"}
                            </Button>
                        )}
                    </Card.Footer>
                </Card>
            </div>
        </main>
    )
}

export default CourseWizardPage