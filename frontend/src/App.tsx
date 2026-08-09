import { useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import CertificatesPage from "./pages/CertificatesPage"
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
// Dashboard is currently JavaScript; it is intentionally used until it is migrated to TypeScript.
// @ts-expect-error No declaration file exists for Dashboard.jsx.
import Dashboard from "./pages/Dashboard"
import { InstructorCourseEditorPage } from "./pages/instructor/InstructorCourseEditorPage"
import { InstructorCourseStudentsPage } from "./pages/instructor/InstructorCourseStudentsPage"
import { InstructorCourseWizardPage } from "./pages/instructor/InstructorCourseWizardPage"
import { InstructorCoursesPage } from "./pages/instructor/InstructorCoursesPage"
import { InstructorOverviewPage } from "./pages/instructor/InstructorOverviewPage"
import { InstructorQuizBuilderPage } from "./pages/instructor/InstructorQuizBuilderPage"

<<<<<<< Updated upstream
=======
// admin page resolved by Eng. Salem
import AdminDashboard from "./pages/adminDashboard"
import LessonEditorPage from "./pages/LessonEditorPage"

>>>>>>> Stashed changes
function HashScroll() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    const id = decodeURIComponent(hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <HashScroll />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/style-guide" element={<StyleGuidePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/courses" element={<CatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/instructors/maha-al-salem" element={<InstructorPublicPage />} />
        <Route path="/instructor" element={<InstructorOverviewPage />} />
        <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
        <Route path="/instructor/courses/new" element={<InstructorCourseWizardPage />} />
        <Route path="/instructor/courses/:courseId/edit" element={<InstructorCourseEditorPage />} />
        <Route path="/instructor/courses/:courseId/quiz" element={<InstructorQuizBuilderPage />} />
        <Route path="/instructor/courses/:courseId/students" element={<InstructorCourseStudentsPage />} />
        <Route path="/instructor/courses/:courseId/lessons" element={<LessonEditorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
