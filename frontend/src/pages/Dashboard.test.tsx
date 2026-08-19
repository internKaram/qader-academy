import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import * as progressService from '../services/progressService';
import type { Enrollment, Progress } from '../types/progress';

vi.mock('../services/progressService');

const mockedGetEnrollments = vi.mocked(progressService.getEnrollments);
const mockedGetProgress = vi.mocked(progressService.getProgress);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

function makeEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    _id: 'enr1',
    course: {
      _id: 'course1',
      title: 'Intro to React',
      instructor: 'Karam',
      category: 'Frontend',
    },
    ...overrides,
  };
}

function makeProgress(overrides: Partial<Progress> = {}): Progress {
  return {
    student: 'student1',
    course: 'course1',
    completedLessons: [],
    quizPassed: false,
    completionPercentage: 0,
    certificateIssued: false,
    ...overrides,
  };
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows a loading spinner while enrollments are being fetched', () => {
    mockedGetEnrollments.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText(/loading your courses/i)).toBeInTheDocument();
  });

  it('shows the empty state when the student has no enrollments', async () => {
    mockedGetEnrollments.mockResolvedValue([]);
    renderDashboard();
    expect(await screen.findByText(/not enrolled in any courses yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse courses/i })).toBeInTheDocument();
  });

  it('renders a course card per enrollment once data has loaded', async () => {
    mockedGetEnrollments.mockResolvedValue([makeEnrollment()]);
    mockedGetProgress.mockResolvedValue(makeProgress({ completionPercentage: 40 }));
    renderDashboard();
    expect(await screen.findByText('Intro to React')).toBeInTheDocument();
    expect(screen.getAllByText('40%').length).toBeGreaterThan(0);
  });

  it('renders link to course details when Continue Learning is rendered', async () => {
    mockedGetEnrollments.mockResolvedValue([makeEnrollment()]);
    mockedGetProgress.mockResolvedValue(makeProgress({ completionPercentage: 40 }));
    renderDashboard();
    const continueLink = await screen.findByRole('link', {
      name: /continue learning/i,
    });
    expect(continueLink).toHaveAttribute('href', '/courses/course1');
  });

  it('shows an error banner with a retry button when loading fails', async () => {
    mockedGetEnrollments.mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });
    renderDashboard();
    expect(await screen.findByText('Server error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});