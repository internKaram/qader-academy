import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import * as authHook from '../hooks/useAuth';

// Mock component representations for page tests
function MockAdminDashboard() {
  return <div data-testid="admin-dashboard-page">Admin Dashboard View</div>;
}

function MockInstructorOverview() {
  return <div data-testid="instructor-overview-page">Instructor Overview View</div>;
}

function MockInstructorCourses() {
  return <div data-testid="instructor-courses-page">Instructor Courses List View</div>;
}

function MockCourseWizard() {
  return <div data-testid="course-wizard-page">Course Creation Wizard View</div>;
}

function MockLessonEditor() {
  return <div data-testid="lesson-editor-page">Lesson Editor View</div>;
}

function MockForbiddenPage() {
  return <div data-testid="forbidden-page">403 Access Denied</div>;
}

function MockNotFoundPage() {
  return <div data-testid="not-found-page">404 Page Not Found</div>;
}

function renderRouteTree(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        {/* Protected Instructor Workspace routes */}
        <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
          <Route path="/instructor" element={<MockInstructorOverview />} />
          <Route path="/instructor/courses" element={<MockInstructorCourses />} />
          <Route path="/instructor/courses/new" element={<MockCourseWizard />} />
          <Route path="/instructor/courses/:courseId/lessons" element={<MockLessonEditor />} />
        </Route>

        {/* Protected Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<MockAdminDashboard />} />
        </Route>

        <Route path="/forbidden" element={<MockForbiddenPage />} />
        <Route path="*" element={<MockNotFoundPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Frontend UI ProtectedRoute & RBAC (Happy Path & Bad Path Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // 1. ADMIN DASHBOARD ROUTE (/admin)
  // ==========================================
  describe('Page: /admin', () => {
    it('[Happy Path] should render Admin Dashboard when authenticated as Admin (salem@qader.com)', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: { id: 'admin_1', name: 'Salem Admin', email: 'salem@qader.com', role: 'admin' },
        token: 'valid_admin_token',
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/admin');

      // Admin Dashboard is rendered successfully
      expect(screen.getByTestId('admin-dashboard-page')).toBeDefined();
      expect(screen.queryByText('Page not found')).toBeNull();
    });

    it('[Bad Path - Unauthenticated] should NOT render Admin Dashboard and show 404 for unauthenticated visitor', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/admin');

      // Admin Dashboard must not mount; 404 stealth page is shown
      expect(screen.queryByTestId('admin-dashboard-page')).toBeNull();
      expect(screen.getByText('Page not found')).toBeDefined();
    });

    it('[Bad Path - Unauthorized Student] should NOT render Admin Dashboard and show 404 for Student user', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: { id: 'student_1', name: 'Fisal Student', email: 'fisal@qader.com', role: 'student' },
        token: 'valid_student_token',
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/admin');

      expect(screen.queryByTestId('admin-dashboard-page')).toBeNull();
      expect(screen.getByText('Page not found')).toBeDefined();
    });
  });

  // ==========================================
  // 2. INSTRUCTOR OVERVIEW ROUTE (/instructor)
  // ==========================================
  describe('Page: /instructor', () => {
    it('[Happy Path] should render Instructor Workspace when authenticated as Instructor (maha@qader.com)', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: { id: 'instructor_1', name: 'Maha Instructor', email: 'maha@qader.com', role: 'instructor' },
        token: 'valid_instructor_token',
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/instructor');

      expect(screen.getByTestId('instructor-overview-page')).toBeDefined();
      expect(screen.queryByText('Page not found')).toBeNull();
    });

    it('[Bad Path - Unauthenticated] should NOT render Instructor Workspace and show 404 for unauthenticated visitor', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/instructor');

      expect(screen.queryByTestId('instructor-overview-page')).toBeNull();
      expect(screen.getByText('Page not found')).toBeDefined();
    });

    it('[Bad Path - Unauthorized Admin] should NOT render Instructor Workspace and show 404 for Admin user', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: { id: 'admin_1', name: 'Salem Admin', email: 'salem@qader.com', role: 'admin' },
        token: 'valid_admin_token',
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/instructor');

      expect(screen.queryByTestId('instructor-overview-page')).toBeNull();
      expect(screen.getByText('Page not found')).toBeDefined();
    });
  });

  // ==========================================
  // 3. INSTRUCTOR COURSES ROUTE (/instructor/courses)
  // ==========================================
  describe('Page: /instructor/courses', () => {
    it('[Happy Path] should render Courses list when authenticated as Instructor', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: { id: 'instructor_1', name: 'Maha Instructor', email: 'maha@qader.com', role: 'instructor' },
        token: 'valid_instructor_token',
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/instructor/courses');

      expect(screen.getByTestId('instructor-courses-page')).toBeDefined();
      expect(screen.queryByText('Page not found')).toBeNull();
    });

    it('[Bad Path] should block Student from viewing /instructor/courses and show 404', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: { id: 'student_1', name: 'Fisal Student', email: 'fisal@qader.com', role: 'student' },
        token: 'valid_student_token',
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/instructor/courses');

      expect(screen.queryByTestId('instructor-courses-page')).toBeNull();
      expect(screen.getByText('Page not found')).toBeDefined();
    });
  });

  // ==========================================
  // 4. COURSE WIZARD ROUTE (/instructor/courses/new)
  // ==========================================
  describe('Page: /instructor/courses/new', () => {
    it('[Happy Path] should render Course Creation Wizard for authenticated Instructor', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: { id: 'instructor_1', name: 'Maha Instructor', email: 'maha@qader.com', role: 'instructor' },
        token: 'valid_instructor_token',
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/instructor/courses/new');

      expect(screen.getByTestId('course-wizard-page')).toBeDefined();
      expect(screen.queryByText('Page not found')).toBeNull();
    });

    it('[Bad Path] should block unauthenticated visitors from accessing Course Wizard', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/instructor/courses/new');

      expect(screen.queryByTestId('course-wizard-page')).toBeNull();
      expect(screen.getByText('Page not found')).toBeDefined();
    });
  });

  // ==========================================
  // 5. LESSON EDITOR ROUTE (/instructor/courses/:courseId/lessons)
  // ==========================================
  describe('Page: /instructor/courses/:courseId/lessons', () => {
    it('[Happy Path] should render Lesson Editor for authenticated Instructor', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: { id: 'instructor_1', name: 'Maha Instructor', email: 'maha@qader.com', role: 'instructor' },
        token: 'valid_instructor_token',
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/instructor/courses/course_123/lessons');

      expect(screen.getByTestId('lesson-editor-page')).toBeDefined();
      expect(screen.queryByText('Page not found')).toBeNull();
    });

    it('[Bad Path] should block Student from accessing Lesson Editor and show 404', () => {
      vi.spyOn(authHook, 'useAuth').mockReturnValue({
        user: { id: 'student_1', name: 'Fisal Student', email: 'fisal@qader.com', role: 'student' },
        token: 'valid_student_token',
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
      });

      renderRouteTree('/instructor/courses/course_123/lessons');

      expect(screen.queryByTestId('lesson-editor-page')).toBeNull();
      expect(screen.getByText('Page not found')).toBeDefined();
    });
  });
});
