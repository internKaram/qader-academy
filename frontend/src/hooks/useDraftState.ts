import { useEffect, useRef, useState } from "react"

export function useDraftState<T>(storageKey: string, initialValue: T) {
    const [draft, setDraft] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(storageKey)
            return saved ? JSON.parse(saved) : initialValue
        } catch {
            return initialValue
        }
    })

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            localStorage.setItem(storageKey, JSON.stringify(draft))
        }, 500)
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [draft, storageKey])

    const clearDraft = () => {
        localStorage.removeItem(storageKey)
    }

    return { draft, setDraft, clearDraft }
}