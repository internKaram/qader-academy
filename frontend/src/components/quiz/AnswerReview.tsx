import { Check, X } from "lucide-react"
import type { QuizAttemptAnswer } from "../../types/quiz"
import { pillNeutralClass } from "./quizStyles"

interface AnswerReviewProps {
    answer: QuizAttemptAnswer
    number: number
    // "student" = the student reviewing their own attempt, "instructor" = reviewing a student's
    viewer: "student" | "instructor"
    // Bigger card for the student review page, compact inside the instructor results
    size?: "lg" | "sm"
}

// One question from an attempt: the pick vs. the correct answer ("Review Answers" in the design)
export function AnswerReview({ answer, number, viewer, size = "sm" }: AnswerReviewProps) {
    const whose = viewer === "student" ? "Your answer" : "Student's answer"
    const skipped = answer.selectedIndex === null
    const large = size === "lg"

    return (
        <div className={`border border-line bg-canvas ${large ? "rounded-card p-5 sm:p-[22px]" : "rounded-[20px] p-4"}`}>
            <div className={`flex items-center justify-between gap-3 ${large ? "mb-3.5" : "mb-2.5"}`}>
                <div className="flex items-center gap-2.5">
                    <span className={pillNeutralClass}>Question {number}</span>
                    <span
                        className={`grid size-5 place-items-center rounded-full ${answer.isCorrect ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                        role="img"
                        aria-label={answer.isCorrect ? "Correct" : "Incorrect"}
                    >
                        {answer.isCorrect ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
                    </span>
                </div>
                <span className="text-xs font-semibold text-ink-muted">{answer.isCorrect ? 1 : 0}/1 pt</span>
            </div>
            <p className={`font-bold text-ink ${large ? "mb-3.5 text-[15px]" : "mb-3 text-sm"}`}>{answer.questionText}</p>
            <div className="flex flex-col gap-2">
                {answer.options.map((option, oIndex) => {
                    const isCorrectOption = oIndex === answer.correctIndex
                    const isPicked = oIndex === answer.selectedIndex
                    let rowClass = "border-line bg-canvas"
                    let label: string | null = null
                    let labelClass = "text-ink-muted"
                    if (isCorrectOption) {
                        rowClass = "border-success bg-success-light"
                        label = isPicked ? `${whose} · Correct` : "Correct answer"
                        labelClass = "text-success-dark"
                    } else if (isPicked) {
                        rowClass = "border-danger bg-danger-light"
                        label = whose
                        labelClass = "text-danger-dark"
                    }
                    return (
                        <div key={oIndex} className={`flex items-center justify-between gap-3 rounded-control border-[1.5px] px-3.5 py-2.5 ${rowClass}`}>
                            <span className="text-[13px] text-ink">{option}</span>
                            {label && <span className={`shrink-0 text-[11px] font-extrabold ${labelClass}`}>{label}</span>}
                        </div>
                    )
                })}
            </div>
            {skipped && (
                <p className="mt-2 text-xs font-semibold text-danger-dark">
                    {viewer === "student" ? "You skipped this question." : "The student skipped this question."}
                </p>
            )}
        </div>
    )
}
