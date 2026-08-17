import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotFoundPage } from '../pages/NotFoundPage';
import { Spinner } from './ui/Spinner';

/**
 * Props for the ProtectedRoute component.
 *
 * @interface ProtectedRouteProps
 * @property {Array<'student' | 'instructor' | 'admin'>} [allowedRoles] - Optional list of permitted roles. If omitted, any authenticated user is allowed.
 * @property {ReactNode} [children] - Optional child elements to render if authorized.
 */
interface ProtectedRouteProps {
  allowedRoles?: Array<'student' | 'instructor' | 'admin'>;
  children?: ReactNode;
}

/**
 * Route protection wrapper component for React Router (Stealth 404 Mode).
 *
 * Enforces role-based access control with zero-knowledge stealth:
 * - Unauthenticated or unauthorized visitors see a standard `404 Not Found` page,
 *   preventing URL enumeration and probing.
 *
 * @param {ProtectedRouteProps} props - Component properties.
 * @returns {JSX.Element} The child components if authorized, or `NotFoundPage` (404).
 */
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas-soft text-ink-soft">
        <Spinner size="lg" label="Verifying authorization" />
        <span className="text-sm font-semibold text-ink-muted">Verifying authorization...</span>
      </div>
    );
  }

  // Stealth 404: If not logged in or role is not permitted, act as if the route does not exist
  if (!isAuthenticated || (allowedRoles && (!user?.role || !allowedRoles.includes(user.role)))) {
    return <NotFoundPage />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
