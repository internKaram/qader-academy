import { useEffect } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { HomePage } from './pages/HomePage'
import { StyleGuidePage } from './pages/StyleGuidePage'
import CatalogPage from './pages/Catalog'
import CourseDetailPage from "./pages/CourseDetailPage"
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage"
import { ResetPasswordPage } from "./pages/ResetPasswordPage"
import { InstructorPublicPage } from "./pages/InstructorPublicPage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { InstructorCourseEditorPage } from "./pages/instructor/InstructorCourseEditorPage"
import { InstructorCourseStudentsPage } from "./pages/instructor/InstructorCourseStudentsPage"
import { InstructorCourseWizardPage } from "./pages/instructor/InstructorCourseWizardPage"
import { InstructorCoursesPage } from "./pages/instructor/InstructorCoursesPage"
import { InstructorOverviewPage } from "./pages/instructor/InstructorOverviewPage"
import { InstructorQuizBuilderPage } from "./pages/instructor/InstructorQuizBuilderPage"

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
        <Route path="/courses" element={<CatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/instructors/maha-al-salem" element={<InstructorPublicPage />} />
        <Route path="/instructor" element={<InstructorOverviewPage />} />
        <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
        <Route path="/instructor/courses/new" element={<InstructorCourseWizardPage />} />
        <Route path="/instructor/courses/:courseId/edit" element={<InstructorCourseEditorPage />} />
        <Route path="/instructor/courses/:courseId/quiz" element={<InstructorQuizBuilderPage />} />
        <Route path="/instructor/courses/:courseId/students" element={<InstructorCourseStudentsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
