export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
}
 
export interface Course {
  _id: string;
  title: string;
  instructor?: string;
  category?: string;
  thumbnail?: string;
  lessons?: Lesson[];
}
 
export interface Enrollment {
  _id: string;
  course: Course;
  status?: 'active' | 'completed' | 'dropped';
}
 
export interface CompletedLessonEntry {
  lesson: string;
  completedAt?: string;
}
 
export interface Progress {
  _id?: string;
  student: string;
  course: string;
  completedLessons: CompletedLessonEntry[];
  quizPassed: boolean;
  completionPercentage: number;
  certificateIssued: boolean;
  lastAccessedAt?: string;
}
 
export interface FieldError {
  field: string;
  message: string;
}
 
export type ActivityType = 'lesson_completed' | 'enrolled' | 'certificate_issued';
 
export interface Activity {
  _id: string;
  type: ActivityType;
  courseTitle: string;
  lessonTitle?: string;
  occurredAt?: string;
}
 
/** Shape of an Axios error where the backend responded with our standard bodies. */
export interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: FieldError[];
    };
  };
}
 