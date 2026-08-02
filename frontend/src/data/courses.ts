import courseCareerCommunicationImage from '../assets/course-career-communication.webp';
import courseDataAnalysisImage from '../assets/course-data-analysis.webp';
import courseHiddenDraftImage from '../assets/course-hidden-draft.webp';
import courseProductThinkingImage from '../assets/course-product-thinking.webp';
import courseReactFoundationsImage from '../assets/course-react-foundations.webp';

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  instructor: {
    name: string;
    avatarInitials: string;
  };
  rating: number;
  reviewCount: number;
  lessonCount: number;
  duration: string;
  enrolledCount: number;
  priceSar: number;
  thumbnailTone: 'red' | 'green' | 'gold' | 'ink';
  thumbnailImage: string;
  published: boolean;
  featured: boolean;
}

export const courses: Course[] = [
  {
    id: 'course-react-foundations',
    slug: 'react-foundations',
    title: 'React foundations for practical web apps',
    shortDescription:
      'Build responsive interfaces with reusable components, clear state, and a workflow that can grow with a real product.',
    category: 'Frontend',
    instructor: {
      name: 'Maha Al-Salem',
      avatarInitials: 'MS',
    },
    rating: 4.8,
    reviewCount: 126,
    lessonCount: 24,
    duration: '7h 40m',
    enrolledCount: 1180,
    priceSar: 349,
    thumbnailTone: 'red',
    thumbnailImage: courseReactFoundationsImage,
    published: true,
    featured: true,
  },
  {
    id: 'course-data-analysis',
    slug: 'data-analysis',
    title: 'Data analysis for business decisions',
    shortDescription:
      'Practice cleaning data, reading trends, and turning findings into concise dashboards for everyday decisions.',
    category: 'Data',
    instructor: {
      name: 'Noura Haddad',
      avatarInitials: 'NH',
    },
    rating: 4.7,
    reviewCount: 98,
    lessonCount: 18,
    duration: '6h 15m',
    enrolledCount: 860,
    priceSar: 299,
    thumbnailTone: 'green',
    thumbnailImage: courseDataAnalysisImage,
    published: true,
    featured: true,
  },
  {
    id: 'course-career-communication',
    slug: 'career-communication',
    title: 'Career communication that earns trust',
    shortDescription:
      'Improve presentations, stakeholder updates, and interview answers with structured practice and useful feedback.',
    category: 'Career',
    instructor: {
      name: 'Omar Nasser',
      avatarInitials: 'ON',
    },
    rating: 4.9,
    reviewCount: 74,
    lessonCount: 16,
    duration: '4h 55m',
    enrolledCount: 640,
    priceSar: 249,
    thumbnailTone: 'gold',
    thumbnailImage: courseCareerCommunicationImage,
    published: true,
    featured: true,
  },
  {
    id: 'course-product-thinking',
    slug: 'product-thinking',
    title: 'Product thinking for growing teams',
    shortDescription:
      'Learn to define user problems, shape small releases, and measure progress without losing sight of the learner.',
    category: 'Product',
    instructor: {
      name: 'Faisal Kareem',
      avatarInitials: 'FK',
    },
    rating: 4.6,
    reviewCount: 55,
    lessonCount: 20,
    duration: '5h 30m',
    enrolledCount: 510,
    priceSar: 319,
    thumbnailTone: 'ink',
    thumbnailImage: courseProductThinkingImage,
    published: true,
    featured: true,
  },
  {
    id: 'course-hidden-draft',
    slug: 'hidden-draft',
    title: 'Draft course',
    shortDescription: 'This course should not appear until it is published and featured.',
    category: 'Draft',
    instructor: {
      name: 'Qader Team',
      avatarInitials: 'QT',
    },
    rating: 0,
    reviewCount: 0,
    lessonCount: 0,
    duration: '0h',
    enrolledCount: 0,
    priceSar: 0,
    thumbnailTone: 'red',
    thumbnailImage: courseHiddenDraftImage,
    published: false,
    featured: false,
  },
];
