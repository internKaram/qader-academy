import { useState, useEffect } from 'react';
import { fetchEnrollments, type Enrollment } from '../services/enrollmentService';

export const useEnrollments = (studentId: string | null) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // don't fetch until we actually know who's logged in
    if (!studentId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEnrollments(studentId);
        setEnrollments(data);
      } catch (err) {
        setError('Request failed. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studentId]);

  return { enrollments, loading, error };
};