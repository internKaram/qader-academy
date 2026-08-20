import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import type { AxiosResponse } from 'axios';
import LessonPlayer from './LessonPlayer';
import api, { getProgress, markLessonComplete } from '../services/progressService';
import type { Course } from '../types/progress';
/**
 * axios.get() resolves to a full AxiosResponse (status, headers, config,
 * etc.), not just { data }. This helper builds a minimal-but-valid one so
 * mockResolvedValue() below satisfies the real return type instead of
 * needing an `as any` on every call site.
 */
function mockAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  };
}
 
// Mock the service layer: default export (raw axios instance, used for the
// course/lesson fetch) and the named progress functions (used by useProgress).
vi.mock('../services/progressService', () => ({
  default: { get: vi.fn() },
  getProgress: vi.fn(),
  markLessonComplete: vi.fn(),
}));
 
const mockedApiGet = vi.mocked(api.get);
const mockedGetProgress = vi.mocked(getProgress);
const mockedMarkLessonComplete = vi.mocked(markLessonComplete);
 
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ courseId: 'course1' }) };
});
 
const mockCourse: Course = {
  _id: 'course1',
  title: 'Intro to React',
  lessons: [
    {
      _id: 'lesson1',
      title: 'What is React?',
      description: 'A quick overview of React.',
      videoUrl: 'https://example.com/v1.mp4',
    },
    {
      _id: 'lesson2',
      title: 'Components',
      description: 'Building your first component.',
      videoUrl: 'https://example.com/v2.mp4',
    },
  ],
};
 
describe('LessonPlayer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
 
  it('shows a loading spinner while course and progress are being fetched', () => {
    mockedApiGet.mockReturnValue(new Promise(() => {}));
    mockedGetProgress.mockReturnValue(new Promise(() => {}));
 
    render(<LessonPlayer />);
 
    expect(screen.getByText(/loading lesson/i)).toBeInTheDocument();
  });
 
  it('shows an error banner with retry if the course fails to load', async () => {
    mockedApiGet.mockRejectedValue({ response: { data: { message: 'Course not found' } } });
    mockedGetProgress.mockResolvedValue(null);

    render(<LessonPlayer />);

    expect(await screen.findByText('Course not found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry|try again/i })).toBeInTheDocument();
  });

  it('shows the empty state when the course has no lessons', async () => {
    mockedApiGet.mockResolvedValue(
      mockAxiosResponse({ course: { _id: 'course1', title: 'Empty Course', lessons: [] } })
    );
    mockedGetProgress.mockResolvedValue(null);

    render(<LessonPlayer />);

    expect(await screen.findByText(/doesn't have any lessons yet/i)).toBeInTheDocument();
  });

  it('renders the first lesson and its progress bar once loaded', async () => {
    mockedApiGet.mockResolvedValue(mockAxiosResponse({ course: mockCourse }));
    mockedGetProgress.mockResolvedValue({
      student: 'student1',
      course: 'course1',
      completedLessons: [],
      quizPassed: false,
      completionPercentage: 0,
      certificateIssued: false,
    });

    render(<LessonPlayer />);

    expect((await screen.findAllByText('What is React?')).length).toBeGreaterThan(0);
    expect(screen.getByText('A quick overview of React.')).toBeInTheDocument();
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /mark what is react\? as complete/i })
    ).toBeInTheDocument();
  });

  it('marks the active lesson complete and reflects the update without a page refresh', async () => {
    const user = userEvent.setup();
    mockedApiGet.mockResolvedValue(mockAxiosResponse({ course: mockCourse }));
    mockedGetProgress.mockResolvedValue({
      student: 'student1',
      course: 'course1',
      completedLessons: [],
      quizPassed: false,
      completionPercentage: 0,
      certificateIssued: false,
    });
    mockedMarkLessonComplete.mockResolvedValue({
      student: 'student1',
      course: 'course1',
      completedLessons: [{ lesson: 'lesson1' }],
      quizPassed: false,
      completionPercentage: 50,
      certificateIssued: false,
    });

    render(<LessonPlayer />);

    const completeButton = await screen.findByRole('button', {
      name: /mark what is react\? as complete/i,
    });
    await user.click(completeButton);

    await waitFor(() =>
      expect(mockedMarkLessonComplete).toHaveBeenCalledWith('course1', 'lesson1')
    );
    expect(await screen.findByText('Lesson Completed')).toBeInTheDocument();
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
  });
});
 