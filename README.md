### Qader Academy 

---

## 🛠️ Local Environment Setup & Troubleshooting (Docker)

If you are running the project locally using Docker, please follow these steps to ensure the database and servers connect successfully:

### 1. Environment Variables Configuration
Before starting the containers, make sure you have a `.env` file in your **backend** directory with the correct MongoDB connection string:
```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
## Certificate API Contract

### GET /api/v1/certificates

**Description:**
Returns all certificates belonging to the authenticated student.

**Authentication:**
Required (JWT)

**Response:**
- 200 OK
- Array of certificates

---

### POST /api/v1/certificates

**Description:**
Issues a new certificate after successful course completion.

**Authentication:**
System only

**Response:**
- 201 Created
- Newly created certificate

---

### GET /api/v1/verify/:certificateNumber

**Description:**
Verifies a certificate using its unique certificate number.

**Authentication:**
Not required (Public)

**Response:**
- 200 OK
- Certificate information
- 404 Not Found if the certificate does not exist.
# Qader Academy

**Learn anything. Prove you learned it.**

Qader Academy is a full-stack Learning Management System (LMS) where instructors publish courses, students learn at their own pace and prove mastery with auto-graded quizzes, and every completed course earns a verifiable certificate. Built end-to-end on the MERN stack by the QaderTech Summer 2026 intern team.

## Features

- 🔐 **Role-based accounts** — Guest, Student, Instructor, and Admin, each with a tailored experience
- 📚 **Course catalog** — browse and filter published courses without needing an account
- 🎥 **Lessons** — instructor-authored video + text content, consumed in order
- ✅ **Auto-graded quizzes** — instant scoring against a configurable passing threshold
- 📈 **Progress tracking** — a live completion percentage for every enrolled course
- 🏆 **Verifiable certificates** — auto-issued PDF certificates with a public verification link
- 🛠️ **Admin dashboard** — user management and platform-wide analytics

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router, TailwindCSS |
| Backend | Node.js 18, Express.js, JWT auth |
| Database | MongoDB + Mongoose |
| Tooling | ESLint, Prettier, GitHub Actions CI |

## Project Structure

```
qader-academy/
├── backend/     # Express REST API (/api/v1)
└── frontend/    # React single-page app (Vite)
```

## Getting Started

Each side of the app is installed and run independently — open two terminals.

**1. Clone the repo**
```
git clone https://github.com/internKaram/qader-academy.git
cd qader-academy
```

**2. Backend**
```
cd backend (you must be in the backend folder)
npm install
npm run dev
```

**3. Frontend** (in a separate terminal)
(you must be in the frontend folder)
```
cd frontend
npm install
npm run dev
```
The frontend dev server prints a local URL (typically `http://localhost:5173`) — open it in your browser.

> A `docker-compose` setup for one-command startup is planned (Epic `CRS`, owned by Karam) but not yet part of the repo — for now, run each side manually as above.

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
