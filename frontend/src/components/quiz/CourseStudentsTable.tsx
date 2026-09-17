import { Users } from "lucide-react"
import type { CourseStudent, CourseStudentsReport } from "../../types/quiz"
import { cardClass, pillDangerClass, pillNeutralClass, pillSuccessClass, pillWarningClass } from "./quizStyles"

function formatDay(value: string) {
    return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" })
}

function statusPill(status: CourseStudent["status"]) {
    if (status === "completed") return <span className={pillSuccessClass}>Completed</span>
    if (status === "suspended") return <span className={pillWarningClass}>Suspended</span>
    return <span className={pillNeutralClass}>Active</span>
}

// Instructor view: every enrolled student, with their latest attempt on each quiz
export function CourseStudentsTable({ report }: { report: CourseStudentsReport }) {
    const { quizzes, students } = report

    if (students.length === 0) {
        return (
            <div className="rounded-card border-2 border-dashed border-line-strong bg-canvas-soft p-10 text-center">
                <Users className="mx-auto size-6 text-ink-muted" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-extrabold text-ink">No students have enrolled yet</h2>
                <p className="mt-1 text-sm text-ink-muted">Students appear here as soon as they enroll in this course.</p>
            </div>
        )
    }

    const tookAll = students.filter((s) => quizzes.length > 0 && s.grades.length === quizzes.length).length

    return (
        <div className={`${cardClass} overflow-hidden`}>
            <p className="border-b border-line px-5 py-3.5 text-xs font-semibold text-ink-muted">
                {students.length} {students.length === 1 ? "student" : "students"} enrolled
                {quizzes.length > 0 && ` · ${tookAll} took every quiz`} · grades show each student's latest attempt
            </p>
            <div className="overflow-x-auto">
                <table className="w-full min-w-max text-left text-sm">
                    <thead className="bg-canvas-soft text-xs font-extrabold text-ink-soft">
                        <tr>
                            <th scope="col" className="px-5 py-3">Student</th>
                            <th scope="col" className="px-5 py-3">Enrolled</th>
                            {quizzes.map((quiz) => (
                                <th key={quiz._id} scope="col" className="px-5 py-3">
                                    <span className="block max-w-[180px] truncate text-ink" title={quiz.title}>{quiz.title}</span>
                                    <span className="font-semibold text-ink-muted">Pass {quiz.passingScore}%</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student._id} className="border-t border-line align-top">
                                <th scope="row" className="px-5 py-4 font-normal">
                                    <div className="flex items-center gap-3">
                                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas-warm text-sm font-extrabold text-ink-soft" aria-hidden="true">
                                            {student.name.trim().charAt(0).toUpperCase() || "?"}
                                        </span>
                                        <div>
                                            <p className="font-bold text-ink">{student.name}</p>
                                            <p className="text-xs text-ink-muted">{student.email}</p>
                                        </div>
                                    </div>
                                </th>
                                <td className="px-5 py-4">
                                    <p className="mb-1.5 text-[13px] text-ink">{formatDay(student.enrolledAt)}</p>
                                    {statusPill(student.status)}
                                </td>
                                {quizzes.map((quiz) => {
                                    const grade = student.grades.find((g) => g.quizId === quiz._id)
                                    if (!grade) {
                                        return (
                                            <td key={quiz._id} className="px-5 py-4 text-[13px] font-semibold text-ink-muted">Not taken</td>
                                        )
                                    }
                                    return (
                                        <td key={quiz._id} className="px-5 py-4">
                                            <p className="font-extrabold text-ink">
                                                {grade.correctCount}/{grade.totalQuestions}
                                                <span className="ml-1 font-semibold text-ink-muted">· {grade.scorePercent}%</span>
                                            </p>
                                            <span className={`mt-1.5 ${grade.passed ? pillSuccessClass : pillDangerClass}`}>
                                                {grade.passed ? "Passed" : "Not passed"}
                                            </span>
                                            <p className="mt-1.5 text-xs text-ink-muted">
                                                {grade.attemptCount === 1 ? "1 attempt" : `${grade.attemptCount} attempts`} · {formatDay(grade.submittedAt)}
                                            </p>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {quizzes.length === 0 && (
                <p className="border-t border-line px-5 py-3.5 text-xs font-semibold text-ink-muted">
                    Grades will show here once you create a quiz and students take it.
                </p>
            )}
        </div>
    )
}
