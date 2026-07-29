import { useAuth } from '../hooks/useAuth';
import { useEnrollments } from '../hooks/useEnrollments';

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { enrollments, loading: enrollmentsLoading, error } = useEnrollments(user?.id ?? null);

  // 1. Loading State
  if (authLoading || enrollmentsLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading your dashboard...</h2>
        <div style={{ opacity: 0.6 }}>Please wait while we fetch your data.</div>
      </div>
    );
  }

  // 2. Unauthenticated / Not Logged In State
  if (!isAuthenticated || !user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Please log in to view your student dashboard.</p>
        <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Login</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Arial, sans-serif', padding: '0 20px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '20px', marginBottom: '20px' }}>
        <div>
          <h1>Welcome, {user.name || 'Student'}!</h1>
          <p style={{ color: '#666', margin: 0 }}>Email: {user.email}</p>
        </div>
        <button 
          onClick={logout} 
          style={{ padding: '8px 16px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      {/* 3. Error State */}
      {error && (
        <div style={{ background: '#ffe6e6', color: '#cc0000', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '10px', padding: '5px 10px', background: '#cc0000', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* 4. Empty vs Success State */}
      <h2>My Enrolled Courses</h2>
      {enrollments.length === 0 ? (
        <div style={{ background: '#f9f9f9', padding: '30px', textAlign: 'center', borderRadius: '8px', border: '1px dashed #ccc' }}>
          <p>You are not enrolled in any courses yet.</p>
          <a href="/catalog" style={{ color: '#0066cc', fontWeight: 'bold' }}>Browse Course Catalog</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {enrollments.map((item) => {
            // Handle if courseId is populated as an object or just a string ID
            const courseTitle = typeof item.courseId === 'object' && item.courseId !== null 
              ? item.courseId.title 
              : `Course ID: ${item.courseId}`;

            return (
              <div key={item._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{courseTitle || 'Untitled Course'}</h3>
                  <small style={{ color: '#888' }}>Enrolled on: {new Date(item.enrolledAt).toLocaleDateString()}</small>
                </div>
                <span style={{ 
                  padding: '5px 10px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  background: item.status === 'completed' ? '#e6ffe6' : '#e6f2ff',
                  color: item.status === 'completed' ? '#008000' : '#0066cc'
                }}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}