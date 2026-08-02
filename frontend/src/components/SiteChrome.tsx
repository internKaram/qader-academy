import { forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { NavSignInButton } from './NavSignInButton';

function sectionHref(basePath: string, id: string) {
  return `${basePath}#${id}`;
}

interface SiteFooterProps {
  sectionBasePath?: string;
}

interface SiteHeaderProps {
  sectionBasePath?: string;
}

interface SiteChromeProps {
  children: ReactNode;
  className?: string;
  footerSectionBasePath?: string;
  headerSectionBasePath?: string;
}

export const SiteChrome = forwardRef<HTMLDivElement, SiteChromeProps>(function SiteChrome({
  children,
  className = 'min-h-screen bg-canvas-soft text-ink',
  footerSectionBasePath,
  headerSectionBasePath = '/',
}: SiteChromeProps, ref) {
  return (
    <div ref={ref} className={className}>
      <SiteHeader sectionBasePath={headerSectionBasePath} />
      {children}
      <SiteFooter sectionBasePath={footerSectionBasePath ?? headerSectionBasePath} />
    </div>
  );
});

export function SiteHeader({ sectionBasePath = '/' }: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/90 shadow-[0_10px_30px_rgb(18_24_38_/_0.06)] backdrop-blur-xl">
      <div className="page-container flex min-h-18 items-center justify-between gap-6">
        <Link className="font-display text-xl font-black tracking-normal text-ink" to="/" aria-label="QaderAcademy home">
          QaderAcademy
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold text-ink-soft md:flex" aria-label="Primary navigation">
          <Link className="transition hover:text-brand-700" to={sectionHref(sectionBasePath, 'features')}>
            About
          </Link>
          <Link className="transition hover:text-brand-700" to="/courses">
            Courses
          </Link>
          <Link className="transition hover:text-brand-700" to={sectionHref(sectionBasePath, 'contact')}>
            Contact
          </Link>
        </nav>
        <NavSignInButton />
      </div>
    </header>
  );
}

export function SiteFooter({ sectionBasePath = '' }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-canvas-dark pt-14 text-white" id="contact">
      <div className="page-container">
        <div className="grid gap-10 border-b border-white/12 pb-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1fr]">
          <div>
            <a className="font-display text-2xl font-black text-white" href="/" aria-label="QaderAcademy home">
              QaderAcademy
            </a>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/68">
              Practical learning paths for career-relevant skills.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">Learn</h2>
            <nav className="mt-4 grid gap-3 text-sm font-bold text-white/68" aria-label="Course categories">
              <a className="transition hover:text-white" href={sectionHref(sectionBasePath, 'top-courses')}>
                Featured courses
              </a>
              <a className="transition hover:text-white" href={sectionHref(sectionBasePath, 'top-courses')}>
                Frontend development
              </a>
              <a className="transition hover:text-white" href={sectionHref(sectionBasePath, 'top-courses')}>
                Data analysis
              </a>
              <a className="transition hover:text-white" href={sectionHref(sectionBasePath, 'top-courses')}>
                Career communication
              </a>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">Company</h2>
            <nav className="mt-4 grid gap-3 text-sm font-bold text-white/68" aria-label="Company navigation">
              <a className="transition hover:text-white" href={sectionHref(sectionBasePath, 'features')}>
                About
              </a>
              <a className="transition hover:text-white" href={sectionHref(sectionBasePath, 'testimonials')}>
                Testimonials
              </a>
              <a className="transition hover:text-white" href="/contact">
                Contact
              </a>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">Contact</h2>
            <div className="mt-4 grid gap-3 text-sm text-white/68">
              <p>Madinah, Saudi Arabia</p>
              <a className="font-bold transition hover:text-white" href="mailto:hello@qaderacademy.example">
                support@qaderacademy.com
              </a>
              <a className="font-bold transition hover:text-white" href="tel:+966500000000">
                +966 56 001 9865
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 text-sm text-white/56 md:flex-row md:items-center md:justify-between">
          <p>Copyright {currentYear} QaderAcademy. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <span aria-disabled="true">Privacy policy coming soon</span>
            <span aria-disabled="true">Terms of use coming soon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
