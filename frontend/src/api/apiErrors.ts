// Maps the backend's 400 response shape:
//   { errors: [{ field: "title", message: "Title is required" }, ...] }
// into a flat object the frontend can key inputs off of:
//   { title: "Title is required", ... }
export function extractFieldErrors(err: unknown): Record<string, string> {
    const response = (err as { response?: { data?: { errors?: unknown } } })?.response
    const errors = response?.data?.errors

    if (!Array.isArray(errors)) return {}

    return errors.reduce((accumulator: Record<string, string>, entry) => {
        const { field, message } = entry as { field?: string; message?: string }
        if (typeof field === "string" && typeof message === "string") {
            accumulator[field] = message
        }
        return accumulator
    }, {})
}

// True only for a 400 with a parseable errors[] array — lets callers distinguish
// "show field errors" from "show a generic failure message".
export function isFieldValidationError(err: unknown): boolean {
    const response = (err as { response?: { status?: number; data?: { errors?: unknown } } })?.response
    return response?.status === 400 && Array.isArray(response?.data?.errors)
}