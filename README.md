### Qader Academy

An online Learning Management System (LMS) built with the MERN stack (MongoDB, Express.js, React, Node.js). See the [SRS document](.) for the full product specification.

## API Contracts

Each feature squad owns and documents its own slice of the `/api/v1` REST API. All protected endpoints require an `Authorization: Bearer <token>` header (JWT, 7-day expiry). All requests and responses use `application/json`.

### Quiz & Assessment (Owner: Mu'ayyad)

Covers quiz authoring by instructors and quiz taking with auto-grading by students. Corresponds to Epic `QUIZ` (stories QUIZ-01, QUIZ-02, QUIZ-03) in the SRS.

**Models**

| Model | Key Fields |
|---|---|
| `Quiz` | `id`, `courseId`, `lessonId`, `title`, `passingScore` |
| `Question` | `id`, `quizId`, `text`, `options[4]`, `correctIndex`, `points` |

**Endpoints**

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/quizzes` | Instructor | Create a quiz attached to a course, with a passing score threshold. Questions (text, 4 options, correct index) are attached during authoring. |
| `GET` | `/api/v1/quizzes/:quizId` | Student | Fetch a quiz's questions **without** the `correctIndex` field, so the answer key is never exposed to the client. |
| `POST` | `/api/v1/quizzes/:quizId/submit` | Student | Submit an answer array; the backend grades it against `correctIndex`, persists the score to the student's progress, and returns the score and pass/fail result. |

**Behavior notes**

- Grading is a pure, stateless function so it can be unit-tested against edge cases: empty submission, partial submission, all-correct, all-wrong.
- If the submitted score meets `passingScore` and all lessons in the course are complete, quiz submission triggers certificate issuance (Epic `CERT`, owned by Raghad) via the progress flow (Epic `PROG`, owned by Sabreen).
- The quiz runner (frontend) must prevent navigation away mid-quiz and show a question counter.

**Dependencies**

- `Karam` (Epic `CRS`) — the `Lesson.quizId` reference that attaches a quiz to a lesson.
- `Sabreen` (Epic `PROG`) — reads the quiz score to update per-lesson and per-course progress.

Coordination with both happens strictly through the documented API contract above, not shared code.
