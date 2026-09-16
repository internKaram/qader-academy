import axios from 'axios';
import api from '../api/axios';

// FIX: was missing /v1 — server.js mounts routes at /api/v1/enrollments,
// so every call was 404ing against /api/enrollments.
const API_URL = 'http://localhost:5000/api/v1';

// FIX: matches the real Enrollment.js schema (studentId, courseId, status,
// enrolledAt) instead of a guessed { studentName, course } shape.
// courseId comes back as a string if unpopulated, or as an object once
// enrollmentController.js calls .populate('courseId').
export interface Course {
  _id: string;
  title?: string;
  thumbnail?: string;
}

export interface Enrollment {
  _id: string;
  studentId: string;
  courseId: string | Course;
  status: 'active' | 'completed' | 'suspended';
  enrolledAt: string;
}

// 1. Function to fetch the list of enrollments (used in the Dashboard)
export const fetchEnrollments = async (studentId: string): Promise<Enrollment[]> => {
  try {
    const response = await axios.get(`${API_URL}/enrollments`, {
      params: { studentId },
    });
    // getStudentEnrollments returns { count, enrollments }, not a bare array
    return response.data.enrollments;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
};

// 2. Function to submit a new enrollment (used in the registration/enroll flow)
export const enrollStudent = async (
  studentId: string,
  courseId: string
): Promise<Enrollment> => {
  try {
    const response = await axios.post(`${API_URL}/enrollments`, {
      studentId,
      courseId,
    });
    return response.data;
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
};

// ─── Logged-in student calls ────────────────────────────────────────────────
// These use the shared `api` instance, which attaches the JWT. The backend
// reads the student from the token, so no studentId is sent.

// The course id of an enrollment, whether or not courseId was populated.
// A populated course can be null if the course was deleted.
export const getEnrollmentCourseId = (enrollment: Enrollment): string | null => {
  const course = enrollment.courseId as string | Course | null;
  if (!course) return null;
  return typeof course === 'string' ? course : course._id;
};

// GET /api/v1/enrollments for the logged-in student
export const getMyEnrollments = async (): Promise<Enrollment[]> => {
  const { data } = await api.get<{ count: number; enrollments: Enrollment[] }>('/enrollments');
  return data.enrollments;
};

// Whether the logged-in student is enrolled in this course
export const isEnrolledInCourse = async (courseId: string): Promise<boolean> => {
  const enrollments = await getMyEnrollments();
  return enrollments.some((enrollment) => getEnrollmentCourseId(enrollment) === courseId);
};

// POST /api/v1/enrollments for the logged-in student
export const enrollInCourse = async (courseId: string): Promise<Enrollment> => {
  const { data } = await api.post<{ message: string; enrollment: Enrollment }>('/enrollments', { courseId });
  return data.enrollment;
};
