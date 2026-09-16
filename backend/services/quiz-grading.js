// Grades a student's quiz submission. Pure function: no database, no request objects,
// so the math can be unit tested on its own.
//
// Scoring rules:
// - Every question is worth 1 point.
// - A question the student skipped (no answer, or selectedIndex null) counts as wrong.
// - scorePercent is rounded to 2 decimals for display (2 of 3 -> 66.67).
// - Pass/fail uses the exact fraction, never the rounded percent:
//   passed when correctCount / totalQuestions >= passingScore / 100,
//   checked with whole numbers (correctCount * 100 >= passingScore * totalQuestions)
//   so floating point can't fail a student who hit the passing score exactly
//   (in JavaScript 57 / 100 * 100 is 56.99999999999999, which would fail a 57% pass mark).

// A problem with what the student sent. The controller turns this into a 400 response.
class QuizGradingError extends Error {
    constructor(message, field) {
        super(message)
        this.name = "QuizGradingError"
        this.field = field
    }
}

const isValidIndex = (value, length) => Number.isInteger(value) && value >= 0 && value < length

// Checks the quiz itself. A failure here is a bug or bad data on our side, not the
// student's fault, so it throws a plain Error (which becomes a 500).
function assertValidQuiz(quiz) {
    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        throw new Error("Cannot grade a quiz with no questions")
    }
    if (!Number.isInteger(quiz.passingScore) || quiz.passingScore < 0 || quiz.passingScore > 100) {
        throw new Error("Quiz passingScore must be a whole number between 0 and 100")
    }
    quiz.questions.forEach((question, index) => {
        if (question._id === undefined || question._id === null) {
            throw new Error(`Question ${index} has no _id`)
        }
        if (!Array.isArray(question.options) || question.options.length < 2) {
            throw new Error(`Question ${index} must have at least 2 options`)
        }
        if (!isValidIndex(question.correctIndex, question.options.length)) {
            throw new Error(`Question ${index} has no valid correctIndex (was it loaded with +questions.correctIndex?)`)
        }
    })
}

// Turns the submitted list into a Map of questionId -> selectedIndex (or null),
// rejecting anything that doesn't match the quiz.
function readSubmittedAnswers(quiz, submittedAnswers) {
    if (!Array.isArray(submittedAnswers)) {
        throw new QuizGradingError("Answers must be a list", "answers")
    }

    const questionsById = new Map(quiz.questions.map((question) => [String(question._id), question]))
    const selectedById = new Map()

    submittedAnswers.forEach((answer, index) => {
        const field = `answers[${index}]`
        if (!answer || typeof answer !== "object" || answer.questionId === undefined || answer.questionId === null) {
            throw new QuizGradingError("Each answer needs a questionId", `${field}.questionId`)
        }

        const questionId = String(answer.questionId)
        const question = questionsById.get(questionId)
        if (!question) {
            throw new QuizGradingError(
                "This question is no longer part of the quiz. Reload the quiz and try again.",
                `${field}.questionId`
            )
        }
        if (selectedById.has(questionId)) {
            throw new QuizGradingError("This question was answered more than once", `${field}.questionId`)
        }

        const { selectedIndex } = answer
        if (selectedIndex === null || selectedIndex === undefined) {
            selectedById.set(questionId, null)
        } else if (isValidIndex(selectedIndex, question.options.length)) {
            selectedById.set(questionId, selectedIndex)
        } else {
            throw new QuizGradingError("Selected option is not valid", `${field}.selectedIndex`)
        }
    })

    return selectedById
}

/**
 * @param {{ questions: Array<{ _id: any, text: string, options: string[], correctIndex: number }>, passingScore: number }} quiz
 *   The quiz loaded WITH correct answers.
 * @param {Array<{ questionId: string, selectedIndex: number | null }>} submittedAnswers
 *   What the student picked. Any order; questions may be left out (skipped).
 * @returns {{ answers: object[], correctCount: number, totalQuestions: number, scorePercent: number, passingScore: number, passed: boolean }}
 *   Shaped like a QuizAttempt, with answers in the quiz's question order.
 * @throws {QuizGradingError} when the submission doesn't match the quiz.
 */
function gradeQuiz(quiz, submittedAnswers) {
    assertValidQuiz(quiz)
    const selectedById = readSubmittedAnswers(quiz, submittedAnswers)

    const answers = quiz.questions.map((question) => {
        const selectedIndex = selectedById.has(String(question._id)) ? selectedById.get(String(question._id)) : null
        return {
            questionId: question._id,
            questionText: question.text,
            options: [...question.options],
            selectedIndex,
            correctIndex: question.correctIndex,
            isCorrect: selectedIndex === question.correctIndex,
        }
    })

    const totalQuestions = answers.length
    const correctCount = answers.filter((answer) => answer.isCorrect).length

    return {
        answers,
        correctCount,
        totalQuestions,
        scorePercent: Math.round((correctCount * 10000) / totalQuestions) / 100,
        passingScore: quiz.passingScore,
        passed: correctCount * 100 >= quiz.passingScore * totalQuestions,
    }
}

module.exports = { gradeQuiz, QuizGradingError }
