import { useState, useEffect, useCallback } from 'react';
import { getProgress, markLessonComplete } from '../services/progressService';
 
// Safe default shape — reused on init AND on error, so `progress` is never
// null/undefined at the point a component tries to read from it.
const EMPTY_PROGRESS = { completedLessons: [], completionPercentage: 0 };
 
export default function useProgress(courseId) {
  const [progress, setProgress] = useState(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  const refreshProgress = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getProgress(courseId);
      setProgress(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress. Please try again.');
      // FIX: reset to the safe default shape on failure, instead of leaving
      // `progress` at whatever it was mid-fetch (or undefined on first load).
      setProgress(EMPTY_PROGRESS);
    } finally {
      setLoading(false);
    }
  }, [courseId]);
 
  const markComplete = useCallback(
    async (lessonId) => {
      setError('');
      try {
        const data = await markLessonComplete(courseId, lessonId);
        setProgress(data);
        return data;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to mark lesson complete.';
        setError(message);
        // Deliberately NOT resetting progress here — a failed "mark complete"
        // shouldn't wipe out progress the student already had.
        throw new Error(message);
      }
    },
    [courseId]
  );
 
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);
 
  return {
    progress,
    // FIX: Array.isArray guard even though the service already normalizes —
    // defense in depth in case this hook is ever fed a differently-shaped
    // object by a future caller.
    completedLessons: Array.isArray(progress?.completedLessons) ? progress.completedLessons : [],
    completionPercentage: Number.isFinite(progress?.completionPercentage)
      ? progress.completionPercentage
      : 0,
    loading,
    error,
    refreshProgress,
    markComplete,
  };
}
 