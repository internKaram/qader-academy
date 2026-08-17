import { useState, useEffect, useCallback } from 'react';
import { getProgress, markLessonComplete } from '../services/progressService';
 
/**
 * Tracks progress for a single course: fetches it on mount, and exposes
 * a markComplete() action that updates state optimistically-but-safely
 * (it waits for the server response, since that response carries the
 * authoritative completionPercentage).
 */
export default function useProgress(courseId) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Field-level errors from a 400 response, e.g. [{ field, message }]
  const [fieldErrors, setFieldErrors] = useState([]);
 
  const refreshProgress = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProgress(courseId);
      setProgress(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);
 
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);
 
  const markComplete = useCallback(
    async (lessonId) => {
      setError(null);
      setFieldErrors([]);
      try {
        const updated = await markLessonComplete(courseId, lessonId);
        setProgress(updated);
        return updated;
      } catch (err) {
        if (err.response?.status === 400 && Array.isArray(err.response?.data?.errors)) {
          // express-validator shape: [{ field, message }]
          setFieldErrors(err.response.data.errors);
        } else {
          setError(err.response?.data?.message || 'Failed to update progress.');
        }
        throw err;
      }
    },
    [courseId]
  );
 
  return { progress, loading, error, fieldErrors, refreshProgress, markComplete };
}
 