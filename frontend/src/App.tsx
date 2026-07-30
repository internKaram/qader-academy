import { HomePage } from './pages/HomePage';
import { StyleGuidePage } from './pages/StyleGuidePage';
import CertificatesPage from './pages/CertificatesPage';

function App() {
  const pathname = window.location.pathname;

  // Temporary path-based routing until React Router is added.
  if (pathname === '/style-guide') {
    return <StyleGuidePage />;
  }

  if (pathname === '/certificates') {
    return <CertificatesPage />;
  }

  return <HomePage />;

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from './pages/HomePage'
import { StyleGuidePage } from './pages/StyleGuidePage'
import CatalogPage from './pages/Catalog'
import CourseDetailPage from "./pages/CourseDetailPage"
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage"
import { ResetPasswordPage } from "./pages/ResetPasswordPage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import CourseWizardPage from "./pages/CourseWizardPage"
import LessonEditorPage from "./pages/LessonEditorPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/style-guide" element={<StyleGuidePage />} />
        <Route path="/courses" element={<CatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/instructor/courses/new" element={<CourseWizardPage/>} />
        <Route path="/instructor/courses/:courseId/edit" element={<CourseWizardPage/>} />
        <Route path="/instructor/courses/:courseId/lessons" element={<LessonEditorPage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App 

