import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from './pages/HomePage'
import { StyleGuidePage } from './pages/StyleGuidePage'
import CatalogPage from './pages/Catalog'
import CourseDetailPage from "./pages/CourseDetailPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/style-guide" element={<StyleGuidePage />} />
        <Route path="/courses" element={<CatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App