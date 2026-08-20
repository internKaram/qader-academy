
import axios from 'axios';
 
// Single source of truth for the API base URL — never hardcode it elsewhere.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
 
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// Attach the JWT (stored by the auth squad) to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
/**
 * GET /api/v1/enrollments
 * Returns the logged-in student's enrollments (each with populated course info).
 */
export async function getEnrollments() {
  const { data } = await api.get('/enrollments');
  return data.enrollments;
}
 
/**
 * POST /api/v1/enrollments
 * Enrolls the logged-in student in a course.
 */
export async function enrollInCourse(courseId) {
  const { data } = await api.post('/enrollments', { courseId });
  return data.enrollment;
}
 
/**
 * GET /api/v1/progress/:courseId
 * Returns the logged-in student's progress for a single course.
 * Resolves to `null` (rather than throwing) if no progress exists yet,
 * so callers can treat that as "0% complete" instead of an error state.
 */
export async function getProgress(courseId) {
  try {
    const { data } = await api.get(`/progress/${courseId}`);
    return data.progress;
  } catch (err) {
    if (err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}
 
/**
 * POST /api/v1/progress
 * Marks a lesson complete for the logged-in student and returns the
 * updated progress document (including the new completionPercentage).
 */
export async function markLessonComplete(courseId, lessonId) {
  const { data } = await api.post('/progress', { courseId, lessonId });
  return data.progress;
}
 


export async function getActivity() {
  const { data } = await api.get('/activity');
  return data.activities;
}
 
export default api;