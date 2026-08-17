import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getEnrollments, getProgress } from '../services/progressService';
import { ProgressBar, Spinner, ErrorBanner } from '../components/ui';
import ActivityFeed from '../components/ui/ActivityFeed';
 
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
 
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const enrollments = await getEnrollments(); 
 
      const coursesWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = enrollment?.course || {};
          const courseId = course._id || course.id;
 
          let completionPercentage = 0;
          if (courseId) {
            const progressData = await getProgress(courseId); 
               completionPercentage = progressData?.completionPercentage ?? 0;    
                    }
          return {
            id: courseId,
            title: course.title || 'Untitled course',
            instructor: course.instructor,
            category: course.category,
            description: course.description,
            thumbnail: course.thumbnail || 'https://placehold.co/400x225?text=Course',
            progress: completionPercentage,
          };
        })
      );
 
      setCourses(coursesWithProgress);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your dashboard enrollments. Please try again.');

      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);
 
  if (loading) return <Spinner label="Loading your courses…" />;
  if (error) return <ErrorBanner message={error} onRetry={loadDashboard} />;
 
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back to Qader Academy. Track your learning progress below.</p>
 
      {/* FIX: Array.isArray + length check before ever calling .map() */}
      {!Array.isArray(courses) || courses.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 mb-4">You are not enrolled in any courses yet.</p>
          <Link
            to="/courses"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
           
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-600 rounded-full">
                  {course.category || 'Web Development'}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                  {course.description || 'Learn the basics from scratch'}
                </p>
              </div>
 
              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <ProgressBar percentage={course.progress} />
                </div>
 
                <Link
                  to={`/courses/${course.id}`}
                  className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Feed Component at the bottom of the dashboard */}
      <div className="mt-10">
        <ActivityFeed />
      </div>
    </div>
  );
};

export default Dashboard;