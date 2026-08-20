import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, Eye, LayoutDashboard, LogOut, Menu, Plus, Repeat2, X } from 'lucide-react';
import { instructorProfile } from '../../data/instructorDashboard';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui';

interface InstructorShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}

const instructorCoursesPath = '/instructor/courses';

const navItems = [
  { label: 'Overview', to: '/instructor', icon: LayoutDashboard, isActive: (pathname: string) => pathname === '/instructor' },
  {
    label: 'Courses',
    to: instructorCoursesPath,
    icon: BookOpen,
    isActive: (pathname: string) =>
      pathname === instructorCoursesPath || (pathname.startsWith(`${instructorCoursesPath}/`) && pathname !== `${instructorCoursesPath}/new`),
  },
  { label: 'New Course', to: `${instructorCoursesPath}/new`, icon: Plus, isActive: (pathname: string) => pathname === `${instructorCoursesPath}/new` },
] as const;

function navClassName(isActive: boolean) {
  return [
    'inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-sm font-bold transition',
    isActive ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-ink-soft hover:bg-canvas-warm hover:text-ink',
  ].join(' ');
}

export function InstructorShell({ eyebrow = 'Instructor workspace', title, description, action, children }: InstructorShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || user?.email || instructorProfile.name;
  const displayRole = user?.role || instructorProfile.role;
  const avatarInitials = (user?.name || user?.email || 'IN')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined;
    }

    function closeOnPointerDown(event: PointerEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    }

    window.addEventListener('pointerdown', closeOnPointerDown);
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('pointerdown', closeOnPointerDown);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [profileMenuOpen]);

  function handleSwapAccount() {
    window.localStorage.removeItem('token');
    setProfileMenuOpen(false);
    navigate('/login');
  }

  function handleSignOut() {
    setProfileMenuOpen(false);
    logout();
  }

  return (
    <div className="min-h-screen bg-canvas-soft text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-white/92 backdrop-blur-xl">
        <div className="page-container">
          <div className="flex min-h-18 items-center justify-between gap-4">
            <Link className="font-display text-xl font-black tracking-normal text-ink" to="/" aria-label="QaderAcademy home">
              QaderAcademy
            </Link>

            <nav className="hidden items-center gap-2 lg:flex" aria-label="Instructor navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive(pathname);
                return (
                  <Link aria-current={isActive ? 'page' : undefined} className={navClassName(isActive)} key={item.to} to={item.to}>
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div ref={profileMenuRef} className="relative hidden lg:block">
              <button
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                className="inline-flex min-h-12 items-center gap-3 rounded-control px-2 py-1.5 text-left transition hover:bg-canvas-warm focus-visible:outline-brand-600/45"
                onClick={() => setProfileMenuOpen((open) => !open)}
                type="button"
              >
                <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-sm font-black text-brand-700">
                  {avatarInitials}
                </span>
                <span className="text-right">
                  <span className="block text-sm font-bold text-ink">{displayName}</span>
                  <span className="block text-xs font-semibold text-ink-muted">{displayRole}</span>
                </span>
                <ChevronDown className={['size-4 text-ink-muted transition', profileMenuOpen ? 'rotate-180' : ''].join(' ')} />
              </button>

              {profileMenuOpen ? (
                <div
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-control border border-line bg-white py-2 text-sm font-bold text-ink shadow-lift"
                  role="menu"
                >
                  <Link
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-canvas-warm"
                    onClick={() => setProfileMenuOpen(false)}
                    role="menuitem"
                    to={instructorProfile.publicPath}
                  >
                    <Eye className="size-4 text-brand-700" />
                    View public page
                  </Link>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-canvas-warm"
                    onClick={handleSwapAccount}
                    role="menuitem"
                    type="button"
                  >
                    <Repeat2 className="size-4 text-ink-muted" />
                    Swap account
                  </button>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-danger transition hover:bg-danger-light"
                    onClick={handleSignOut}
                    role="menuitem"
                    type="button"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Link
                aria-label="View instructor public page"
                className="grid size-9 place-items-center rounded-full bg-brand-50 text-sm font-black text-brand-700"
                to={instructorProfile.publicPath}
              >
                {avatarInitials}
              </Link>
              <Button
                aria-label={mobileMenuOpen ? 'Close instructor navigation' : 'Open instructor navigation'}
                iconOnly
                onClick={() => setMobileMenuOpen((open) => !open)}
                size="sm"
                variant="ghost"
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen ? (
            <nav className="grid gap-2 border-t border-line py-3 lg:hidden" aria-label="Mobile instructor navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive(pathname);
                return (
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className={navClassName(isActive)}
                    key={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    to={item.to}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
      </header>

      <main className="page-container py-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 font-display text-heading-lg text-ink">{title}</h1>
            <p className="mt-3 body-copy">{description}</p>
          </div>
          {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
        </div>

        {children}
      </main>
    </div>
  );
}
