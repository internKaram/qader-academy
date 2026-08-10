import useActivity from '../../hooks/useActivity';
import { Spinner } from './Spinner';
import { ErrorBanner } from './ErrorBanner';

interface ActivityItem {
  _id: string;
  type: string;
  courseTitle?: string;
  lessonTitle?: string;
  meta?: {
    score?: number;
    [key: string]: any;
  };
  createdAt: string;
}
const ICONS: Record<string, string> = {
  lesson_completed: '✅',
  course_started: '🚀',
  quiz_passed: '🎯',
  quiz_failed: '📝',
  certificate_issued: '🏆',
};
 
const describeActivity = (activity: ActivityItem): string => {
  switch (activity.type) {
    case 'lesson_completed':
      return `Completed "${activity.lessonTitle}" in ${activity.courseTitle}`;
    case 'course_started':
      return `Started ${activity.courseTitle}`;
    case 'quiz_passed':
      return `Passed the quiz in ${activity.courseTitle} (${activity.meta?.score ?? '—'}%)`;
    case 'quiz_failed':
      return `Attempted the quiz in ${activity.courseTitle} (${activity.meta?.score ?? '—'}%)`;
    case 'certificate_issued':
      return `Earned a certificate for ${activity.courseTitle}`;
    default:
      return activity.courseTitle || '';
  }
};
 
const formatRelativeTime = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
 
export default function ActivityFeed() {
  const { activities, loading, error, hasMore, loadMore, refresh } = useActivity(20);
 
  if (loading) {
    return <Spinner label="Loading recent activity…" />;
  }
 
  if (error) {
    return <ErrorBanner message={error} onRetry={refresh} />;
  }
 
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
        No activity yet — complete a lesson to see it here.
      </div>
    );
  }
 

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Recent Activity
      </h2>
      <ul className="space-y-4">
        {activities.map((activity: ActivityItem) => (
          <li key={activity._id} className="flex items-start gap-3">
            <span className="text-lg leading-none" aria-hidden="true">
              {ICONS[activity.type] || '•'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800">{describeActivity(activity)}</p>
              <time dateTime={activity.createdAt} className="text-xs text-gray-400">
                {formatRelativeTime(activity.createdAt)}
              </time>
            </div>
          </li>
        ))}
      </ul>
 
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Load more
        </button>
      )}
    </div>
  );
}
 