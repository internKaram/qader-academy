import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Menu, Plus, UserRound, X } from 'lucide-react';
import { instructorProfile } from '../../data/instructorDashboard';
import { Button } from '../ui';

interface InstructorShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}

const navItems = [
  { label: 'Overview', to: '/instructor', icon: LayoutDashboard, end: true },
  { label: 'Courses', to: '/instructor/courses', icon: BookOpen, end: false },
  { label: 'New Course', to: '/instructor/courses/new', icon: Plus, end: false },
  { label: 'Profile', to: '/instructor#profile', icon: UserRound, end: false },
] as const;

function navClassName({ isActive }: { isActive: boolean }) {
  return [
    'inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-sm font-bold transition',
    isActive ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-ink-soft hover:bg-canvas-warm hover:text-ink',
  ].join(' ');
}

export function InstructorShell({ eyebrow = 'Instructor workspace', title, description, action, children }: InstructorShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                return (
                  <NavLink className={navClassName} end={item.end} key={item.to} to={item.to}>
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-sm font-black text-brand-700">
                {instructorProfile.avatarInitials}
              </span>
              <div className="text-right">
                <p className="text-sm font-bold text-ink">{instructorProfile.name}</p>
                <p className="text-xs font-semibold text-ink-muted">{instructorProfile.role}</p>
              </div>
            </div>

            <Button
              aria-label={mobileMenuOpen ? 'Close instructor navigation' : 'Open instructor navigation'}
              className="lg:hidden"
              iconOnly
              onClick={() => setMobileMenuOpen((open) => !open)}
              size="sm"
              variant="ghost"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>

          {mobileMenuOpen ? (
            <nav className="grid gap-2 border-t border-line py-3 lg:hidden" aria-label="Mobile instructor navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink className={navClassName} end={item.end} key={item.to} onClick={() => setMobileMenuOpen(false)} to={item.to}>
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
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
