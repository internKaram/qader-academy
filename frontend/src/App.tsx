import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from './pages/HomePage'
import { StyleGuidePage } from './pages/StyleGuidePage'
import CatalogPage from './pages/Catalog'
import CourseDetailPage from "./pages/CourseDetailPage"
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage"
import { ResetPasswordPage } from "./pages/ResetPasswordPage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"

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
      </Routes>
    </BrowserRouter>
  )
}

export default App