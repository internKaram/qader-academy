// @ts-nocheck
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StyleGuidePage } from './pages/StyleGuidePage';
import Dashboard from './pages/Dashboard';
import LessonPlayer from './pages/LessonPlayer';
import { HomePage } from './pages/HomePage';
import { StyleGuidePage } from './pages/StyleGuidePage';
import CertificatesPage from './pages/CertificatesPage';

function App() {
  const pathname = window.location.pathname;

  // Temporary path-based routing until React Router is added.
  if (pathname === '/style-guide') {
    return <StyleGuidePage />;
  }

  /* Routing configuration for Qader Academy student dashboard and lesson player */
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lessons/:courseId" element={<LessonPlayer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
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

