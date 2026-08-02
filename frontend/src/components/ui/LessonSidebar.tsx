import { useState } from 'react';
 
// Matches the shape returned by GET /api/v1/courses/:courseId/lessons
export interface Lesson {
  id: string;
  title: string;
}
 
interface LessonSidebarProps {
  lessons: Lesson[];
  activeLessonId?: string;
  completedLessonIds?: string[];
  onSelectLesson: (lessonId: string) => void;
}
 
// FIX: this file was missing entirely — LessonPlayer.tsx imports it as a
// default export from '../components/LessonSidebar', so this file must live
// at src/components/LessonSidebar.tsx and export a default component.
export default function LessonSidebar({
  lessons = [],
  activeLessonId,
  completedLessonIds = [],
  onSelectLesson,
}: LessonSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const completedSet = new Set(completedLessonIds);
 
  return (
    <aside
      className={`shrink-0 border-b border-gray-200 bg-white lg:border-b-0 lg:border-r ${
        collapsed ? 'lg:w-16' : 'lg:w-72'
      } transition-all duration-200`}
    >
      <div className="flex items-center justify-between px-4 py-3 lg:px-3">
        {!collapsed && (
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Lessons
          </h2>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? 'Expand lesson sidebar' : 'Collapse lesson sidebar'}
          aria-expanded={!collapsed}
          className="ml-auto rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-5 w-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 010 1.06L8.31 10l4.48 4.71a.75.75 0 01-1.08 1.04l-5-5.25a.75.75 0 010-1.04l5-5.25a.75.75 0 011.08.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
 
      <nav aria-label="Lesson list">
        <ul className="max-h-[70vh] overflow-y-auto px-2 pb-4 lg:max-h-[calc(100vh-4rem)]">
          {lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLessonId;
            const isCompleted = completedSet.has(lesson.id);
 
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => onSelectLesson(lesson.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isActive
                      ? 'bg-indigo-50 font-semibold text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                    aria-hidden="true"
                  >
                    {isCompleted ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0l-3.6-3.6a1 1 0 111.4-1.4l2.9 2.9 6.7-6.7a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                  {!collapsed && <span className="line-clamp-2">{lesson.title}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
