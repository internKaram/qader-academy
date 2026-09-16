import { Link } from 'react-router-dom';
import { Button } from './ui';
import { useAuth, type AuthUser } from '../hooks/useAuth';

const dashboardPathByRole: Record<NonNullable<AuthUser['role']>, string> = {
  student: '/dashboard',
  instructor: '/instructor',
  admin: '/admin',
};

export function NavSignInButton() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Avoid flashing "Sign In" while the stored token is still being read
  if (isLoading) return null;

  if (isAuthenticated) {
    const dashboardPath = user?.role ? dashboardPathByRole[user.role] : '/dashboard';

    return (
      <div className="flex items-center gap-2">
        <Link to={dashboardPath}>
          <Button size="sm" variant="outline">
            Dashboard
          </Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={logout}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Link to="/login">
      <Button
        size="sm"
        style={{
          backgroundColor: '#3b635a',
          boxShadow: '0 4px 12px rgba(59, 99, 90, 0.3)',
        }}
      >
        Sign In
      </Button>
    </Link>
  );
}
