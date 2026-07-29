export type InstructorCourseStatus = 'published' | 'draft';
export type LearnerStatus = 'active' | 'needs_review' | 'completed';

export interface InstructorProfile {
  name: string;
  role: string;
  email: string;
  avatarInitials: string;
  bio: string;
}

export interface InstructorLesson {
  id: string;
  title: string;
  videoUrl: string;
  textContent: string;
  durationMinutes: number;
  order: number;
}

export interface InstructorQuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface InstructorQuiz {
  title: string;
  passingScore: number;
  questions: InstructorQuizQuestion[];
}

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  status: InstructorCourseStatus;
  enrolledCount: number;
  completionRate: number;
  lessonCount: number;
  quizQuestionCount: number;
  updatedAt: string;
  lessons: InstructorLesson[];
  quiz: InstructorQuiz;
}

export interface CourseLearner {
  id: string;
  courseId: string;
  name: string;
  email: string;
  progress: number;
  status: LearnerStatus;
  lastActive: string;
  certificate: 'earned' | 'not_yet';
}

export interface InstructorActivity {
  id: string;
  courseId: string;
  label: string;
  detail: string;
  time: string;
}

export const instructorProfile: InstructorProfile = {
  name: 'Maha Al-Salem',
  role: 'Instructor',
  email: 'maha.alsalem@qaderacademy.example',
  avatarInitials: 'MS',
  bio: 'Builds practical web courses with clear lessons, checks for understanding, and learner-friendly examples.',
};

export const instructorCourses: InstructorCourse[] = [
  {
    id: 'react-foundations',
    title: 'React foundations for practical web apps',
    description: 'Build responsive interfaces with reusable components, clear state, and a workflow that can grow with a real product.',
    category: 'Frontend',
    thumbnail: 'react-foundations.webp',
    status: 'published',
    enrolledCount: 118,
    completionRate: 68,
    lessonCount: 8,
    quizQuestionCount: 12,
    updatedAt: 'Today',
    lessons: [
      {
        id: 'lesson-react-01',
        title: 'Component thinking',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        textContent: 'Break a page into small, named interface pieces before writing stateful logic.',
        durationMinutes: 28,
        order: 1,
      },
      {
        id: 'lesson-react-02',
        title: 'Props and state',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        textContent: 'Use props for inputs and state for values that change because of user interaction.',
        durationMinutes: 34,
        order: 2,
      },
      {
        id: 'lesson-react-03',
        title: 'Forms that give feedback',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        textContent: 'Design validation so learners know what happened and what to fix.',
        durationMinutes: 31,
        order: 3,
      },
    ],
    quiz: {
      title: 'React foundations check',
      passingScore: 70,
      questions: [
        {
          id: 'react-q1',
          text: 'Which value should be state?',
          options: ['A static heading', 'A user-edited input value', 'An imported image path', 'A route label'],
          correctIndex: 1,
        },
        {
          id: 'react-q2',
          text: 'What is the safest way to render repeated course cards?',
          options: ['Copy each card manually', 'Use map with a stable key', 'Use random keys', 'Render them in a string'],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    id: 'accessible-ui',
    title: 'Accessible UI patterns for learning tools',
    description: 'Design forms, modals, and tables that keep learners oriented and instructors confident.',
    category: 'Design Systems',
    thumbnail: 'accessible-ui.webp',
    status: 'draft',
    enrolledCount: 0,
    completionRate: 0,
    lessonCount: 5,
    quizQuestionCount: 6,
    updatedAt: 'Yesterday',
    lessons: [
      {
        id: 'lesson-a11y-01',
        title: 'Labels and field help',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        textContent: 'Make every input readable, named, and understandable before validation happens.',
        durationMinutes: 22,
        order: 1,
      },
      {
        id: 'lesson-a11y-02',
        title: 'Keyboard paths',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        textContent: 'Check that important controls work without pointer-only interaction.',
        durationMinutes: 26,
        order: 2,
      },
    ],
    quiz: {
      title: 'Accessible UI checkpoint',
      passingScore: 80,
      questions: [
        {
          id: 'a11y-q1',
          text: 'What should a required text field include?',
          options: ['Only placeholder text', 'A visible label', 'A hidden submit button', 'A disabled default value'],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    id: 'product-thinking',
    title: 'Product thinking for growing teams',
    description: 'Learn to define user problems, shape small releases, and measure progress without losing sight of the learner.',
    category: 'Product',
    thumbnail: 'product-thinking.webp',
    status: 'published',
    enrolledCount: 74,
    completionRate: 52,
    lessonCount: 7,
    quizQuestionCount: 10,
    updatedAt: 'Jul 26',
    lessons: [
      {
        id: 'lesson-product-01',
        title: 'Problem framing',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        textContent: 'Describe the learner pain before committing to a feature or content unit.',
        durationMinutes: 30,
        order: 1,
      },
      {
        id: 'lesson-product-02',
        title: 'Release slicing',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        textContent: 'Choose the smallest useful learning outcome and ship that first.',
        durationMinutes: 33,
        order: 2,
      },
    ],
    quiz: {
      title: 'Product thinking quiz',
      passingScore: 75,
      questions: [
        {
          id: 'product-q1',
          text: 'What should come before solution design?',
          options: ['Visual polish', 'Problem clarity', 'Pricing', 'A release note'],
          correctIndex: 1,
        },
        {
          id: 'product-q2',
          text: 'Why slice a release?',
          options: ['To avoid testing', 'To reduce useful feedback', 'To ship a coherent small outcome', 'To hide incomplete work'],
          correctIndex: 2,
        },
      ],
    },
  },
];

export const courseLearners: CourseLearner[] = [
  {
    id: 'learner-001',
    courseId: 'react-foundations',
    name: 'Layla Al-Othman',
    email: 'layla@example.com',
    progress: 86,
    status: 'active',
    lastActive: 'Today',
    certificate: 'not_yet',
  },
  {
    id: 'learner-002',
    courseId: 'react-foundations',
    name: 'Sami Al-Rashid',
    email: 'sami@example.com',
    progress: 100,
    status: 'completed',
    lastActive: 'Yesterday',
    certificate: 'earned',
  },
  {
    id: 'learner-003',
    courseId: 'react-foundations',
    name: 'Hind Al-Saud',
    email: 'hind@example.com',
    progress: 44,
    status: 'needs_review',
    lastActive: 'Jul 27',
    certificate: 'not_yet',
  },
  {
    id: 'learner-004',
    courseId: 'product-thinking',
    name: 'Omar Nasser',
    email: 'omar@example.com',
    progress: 62,
    status: 'active',
    lastActive: 'Today',
    certificate: 'not_yet',
  },
  {
    id: 'learner-005',
    courseId: 'product-thinking',
    name: 'Noura Haddad',
    email: 'noura@example.com',
    progress: 100,
    status: 'completed',
    lastActive: 'Jul 25',
    certificate: 'earned',
  },
];

export const instructorActivities: InstructorActivity[] = [
  {
    id: 'activity-001',
    courseId: 'react-foundations',
    label: 'Lesson updated',
    detail: 'Forms that give feedback was saved as draft.',
    time: '20 minutes ago',
  },
  {
    id: 'activity-002',
    courseId: 'product-thinking',
    label: 'Quiz edited',
    detail: 'Passing score changed to 75 percent.',
    time: 'Yesterday',
  },
  {
    id: 'activity-003',
    courseId: 'accessible-ui',
    label: 'Course draft',
    detail: 'Accessible UI patterns is ready for lesson review.',
    time: 'Jul 26',
  },
];

export function getInstructorCourse(courseId: string | undefined) {
  return instructorCourses.find((course) => course.id === courseId);
}

export function getCourseLearners(courseId: string | undefined) {
  return courseLearners.filter((learner) => learner.courseId === courseId);
}
