import { useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"

import CertificatesPage from "./pages/CertificatesPage"
import VerifyCertificatePage from "./pages/VerifyCertificatePage"
import CatalogPage from "./pages/Catalog"
import CourseDetailPage from "./pages/CourseDetailPage"
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage"
import { HomePage } from "./pages/HomePage"
import { InstructorPublicPage } from "./pages/InstructorPublicPage"
import { LoginPage } from "./pages/LoginPage"
import { ForbiddenPage } from "./pages/ForbiddenPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { RegisterPage } from "./pages/RegisterPage"
import { ResetPasswordPage } from "./pages/ResetPasswordPage"
import { StyleGuidePage } from "./pages/StyleGuidePage"
import CourseWizardPage from "./pages/CourseWizardPage"

// Dashboard is currently JavaScript; it is intentionally used until it is migrated to TypeScript.
import Dashboard from "./pages/Dashboard"

import { InstructorCourseEditorPage } from "./pages/instructor/InstructorCourseEditorPage"
import { InstructorCourseStudentsPage } from "./pages/instructor/InstructorCourseStudentsPage"
import { InstructorCourseWizardPage } from "./pages/instructor/InstructorCourseWizardPage"
import { InstructorCoursesPage } from "./pages/instructor/InstructorCoursesPage"
import { InstructorOverviewPage } from "./pages/instructor/InstructorOverviewPage"
import { InstructorQuizBuilderPage } from "./pages/instructor/InstructorQuizBuilderPage"

// Admin page resolved by Eng. Salem
import AdminDashboard from "./pages/adminDashboard"

// Lesson editor page (added by Karam)
import LessonEditorPage from "./pages/LessonEditorPage"

function HashScroll() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    const id = decodeURIComponent(hash.slice(1))

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <HashScroll />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/course/:courseId" element={<CourseDetailPage />} />

        {/* Certificate pages */}
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route
          path="/verify/:certificateNumber"
          element={<VerifyCertificatePage />}
        />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Style Guide */}
        <Route path="/style-guide" element={<StyleGuidePage />} />

        {/* Student Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Instructor pages */}
        <Route path="/instructor" element={<InstructorOverviewPage />} />
        <Route
          path="/instructor/courses"
          element={<InstructorCoursesPage />}
        />
        <Route
          path="/instructor/course/:courseId/editor"
          element={<InstructorCourseEditorPage />}
        />
        <Route
          path="/instructor/course/:courseId/students"
          element={<InstructorCourseStudentsPage />}
        />
        <Route
          path="/instructor/course/:courseId/wizard"
          element={<InstructorCourseWizardPage />}
        />
        <Route
          path="/instructor/course/:courseId/quiz"
          element={<InstructorQuizBuilderPage />}
        />

        {/* Course authoring wizard (Karam) */}
        <Route
          path="/instructor/courses/new"
          element={<CourseWizardPage />}
        />
        <Route
          path="/instructor/courses/:courseId/edit"
          element={<CourseWizardPage />}
        />
        <Route
          path="/instructor/courses/:courseId/lessons"
          element={<LessonEditorPage />}
        />

        {/* Public instructor page */}
        <Route
          path="/instructor/:instructorId"
          element={<InstructorPublicPage />}
        />

        {/* Admin page */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Forbidden & Not Found */}
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}