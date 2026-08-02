import axios from 'axios';
 
// Single source of truth for the API base URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
 
const api = axios.create({
  baseURL: API_BASE_URL,
});
 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
// FIX: normalize at the service boundary, not in the component.
// If the backend errors, returns null, or wraps the payload (e.g. { data: [...] }
// instead of a bare array), this guarantees every caller of getEnrollments()
// still receives an array — so `.map()` in Dashboard.jsx can never crash.
export const getEnrollments = async () => {
  const { data } = await api.get('/enrollments');
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data; // tolerate a wrapped { data: [...] } shape
  return [];
};
 
export const enrollInCourse = async (courseId) => {
  const { data } = await api.post('/enrollments', { courseId });
  return data ?? null;
};
 
// FIX: same normalization pattern for progress — guarantees completedLessons
// is always an array and completionPercentage is always a number, even if
// the student has no progress document yet (backend returns nothing / 404).
export const getProgress = async (courseId) => {
  try {
    const { data } = await api.get(`/progress/${courseId}`);
    return {
      courseId,
      completedLessons: Array.isArray(data?.completedLessons) ? data.completedLessons : [],
      completionPercentage: Number.isFinite(data?.completionPercentage)
        ? data.completionPercentage
        : 0,
    };
  } catch {
    // No progress yet for this course is not exceptional — treat as 0%.
    return { courseId, completedLessons: [], completionPercentage: 0 };
  }
};
 
export const markLessonComplete = async (courseId, lessonId) => {
  const { data } = await api.post('/progress', { courseId, lessonId });
  return {
    courseId,
    completedLessons: Array.isArray(data?.completedLessons) ? data.completedLessons : [],
    completionPercentage: Number.isFinite(data?.completionPercentage)
      ? data.completionPercentage
      : 0,
  };
};
 
export default api;
 