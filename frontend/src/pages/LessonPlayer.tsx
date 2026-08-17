import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import LessonSidebar from '../components/ui/LessonSidebar';
import Spinner from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { ProgressBar } from '../components/ui/ProgressBar';
import useProgress from '../hooks/useProgress';
import api from '../services/progressService';
import type { Course, Lesson, ApiErrorResponse } from '../types/progress';
 
export default function LessonPlayer() {
    const { courseId } = useParams<{ courseId: string }>();
 
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
const [activeLessonId, setActiveLessonId] = useState<string | undefined>(undefined);
  const [courseLoading, setCourseLoading] = useState<boolean>(true);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [marking, setMarking] = useState<boolean>(false);
 
   const {
  progress,
  loading: progressLoading,
  error: progressError,
  fieldErrors,
  markComplete,
} = useProgress(courseId) as {
  progress: { 
    completedLessons: Array<{ lesson: string }>;
    completionPercentage: number;
  } | null;
  loading: boolean;
  error: string | null;
  fieldErrors: any;
  markComplete: (lessonId: string) => Promise<any>;
};
 
  // Course + lesson content belongs to the Course Management squad's API
  // (GET /api/v1/courses/:id) — this page only consumes it.
  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    setCourseLoading(true);
    setCourseError(null);
    try {
      const { data } = await api.get<{ course: Course }>(`/courses/${courseId}`);
      setCourse(data.course);
      setLessons(data.course.lessons || []);
      setActiveLessonId((current) => current || data.course.lessons?.[0]?._id || undefined);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      setCourseError(apiErr.response?.data?.message || 'Failed to load course content.');
    } finally {
      setCourseLoading(false);
    }
  }, [courseId]);
 
  useEffect(() => {
    loadCourse();
  }, [loadCourse]);
 
  const completedLessonIds = useMemo<string[]>(
    () => (progress?.completedLessons || []).map((entry) => entry.lesson),
    [progress]
  );
 
  const activeLesson = useMemo<Lesson | null>(
    () => lessons.find((lesson) => lesson._id === activeLessonId) || null,
    [lessons, activeLessonId]
  );
 
  const isActiveLessonComplete = activeLessonId
    ? completedLessonIds.includes(activeLessonId)
    : false;
 
  const handleCompleteLesson = async (): Promise<void> => {
    if (!activeLessonId || isActiveLessonComplete) return;
    setMarking(true);
    try {
      await markComplete(activeLessonId);
    } catch {
     
    } finally {
      setMarking(false);
    }
  };
 
  const loading = courseLoading || progressLoading;
  const error = courseError || progressError;
 
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner label="Loading lesson…" size="lg" />
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorBanner message={error} onRetry={loadCourse} />
      </div>
    );
  }
 
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 sm:flex-row">
      <LessonSidebar
        lessons={lessons as any}
        activeLessonId={activeLessonId}
        completedLessonIds={completedLessonIds}
        onSelectLesson={setActiveLessonId}
      />
 
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
          {course && (
            <div className="mb-6">
              <p className="text-sm font-medium text-indigo-600">{course.title}</p>
              <ProgressBar percentage={progress?.completionPercentage ?? 0} />
            </div>
          )}
 
          {activeLesson ? (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-sm">
                {activeLesson.videoUrl ? (
                  <video
                    key={activeLesson._id}
                    src={activeLesson.videoUrl}
                    controls
                    className="h-full w-full"
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    No video available for this lesson
                  </div>
                )}
              </div>
 
              <h1 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">
                {activeLesson.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                {activeLesson.description}
              </p>
 
              {fieldErrors.length > 0 && (
                <ul
                  role="alert"
                  className="mt-4 space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {fieldErrors.map((err : any) => (
                    <li key={err.field}>
                      <span className="font-semibold capitalize">{err.field}</span>: {err.message}
                    </li>
                  ))}
                </ul>
              )}
 
              <button
                type="button"
                onClick={handleCompleteLesson}
                disabled={isActiveLessonComplete || marking}
                aria-label={
                  isActiveLessonComplete
                    ? 'Lesson already completed'
                    : `Mark ${activeLesson.title} as complete`
                }
                className={`mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isActiveLessonComplete
                    ? 'cursor-default bg-green-100 text-green-700 focus-visible:ring-green-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 disabled:opacity-60'
                }`}
              >
                {isActiveLessonComplete
                  ? 'Lesson Completed'
                  : marking
                  ? 'Saving…'
                  : 'Complete Lesson'}
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500">This course doesn't have any lessons yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
 