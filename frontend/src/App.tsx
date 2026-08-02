// @ts-nocheck
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StyleGuidePage } from './pages/StyleGuidePage';
import Dashboard from './pages/Dashboard';
import LessonPlayer from './pages/LessonPlayer';

function App() {
  const pathname = window.location.pathname;

  // Full React Router integration belongs to the later routing phase.
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