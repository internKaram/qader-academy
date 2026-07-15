import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroImage from '../assets/hero.png';
import { Badge, Button, Modal } from '../components/ui';
import { courses, type Course } from '../data/courses';
import { cn } from '../lib/cn';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '42', label: 'sample courses mapped' },
  { value: '18', label: 'sample instructors' },
  { value: '8.2k', label: 'sample learners' },
];

const features = [
  {
    icon: '01',
    title: 'Expert-led courses',
    description:
      'Designed to support instructor-authored learning paths with practical examples. Course content can be reviewed and expanded before public enrollment opens.',
  },
  {
    icon: '02',
    title: 'Structured lessons',
    description:
      'Designed to organize every course into ordered lessons, resources, and checkpoints. Learners always know what comes next.',
  },
  {
    icon: '03',
    title: 'Assessments and progress',
    description:
      'Designed to support quizzes, completion tracking, and progress records. The first release presents the model without claiming live learner records.',
  },
  {
    icon: '04',
    title: 'Shareable certificates',
    description:
      'Designed to support course certificates after completion rules are approved. Certificate actions are intentionally not exposed before launch.',
  },
];

const testimonials = [
  {
    name: 'Learner placeholder',
    role: 'Career switcher',
    quote:
      'This space is reserved for an approved learner story once QaderAcademy has permission to publish it.',
  },
  {
    name: 'Instructor placeholder',
    role: 'Course author',
    quote:
      'This space is reserved for an approved instructor quote about course structure and learner support.',
  },
  {
    name: 'Team placeholder',
    role: 'Training partner',
    quote:
      'This space is reserved for an approved partner testimonial with a clear source and usage approval.',
  },
];

const thumbnailClasses: Record<Course['thumbnailTone'], string> = {
  red: 'from-brand-600 via-brand-500 to-[#f7b2a6]',
  green: 'from-[#2f6f62] via-[#6fa18f] to-[#c8d7b8]',
  gold: 'from-[#a96f1f] via-[#d7a64a] to-[#f3d89b]',
  ink: 'from-ink via-[#354052] to-[#a9b3c1]',
};

function scrollToTopCourses() {
  document.getElementById('top-courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function navigateTo(path: string) {
  window.location.href = path;
}

function CourseCard({ course, onPreview }: { course: Course; onPreview: (course: Course) => void }) {
  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      data-animate-item
    >
      <div className={cn('relative min-h-40 bg-linear-to-br p-5 text-white', thumbnailClasses[course.thumbnailTone])}>
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,transparent_0_38%,rgba(255,255,255,.45)_38%_40%,transparent_40%_100%)]" />
        <div className="relative flex h-full min-h-28 flex-col justify-between">
          <Badge variant="outline" className="w-fit border-white/40 bg-white/18 text-white ring-white/35">
            {course.category}
          </Badge>
          <div className="mt-8 flex items-end justify-between gap-4">
            <p className="max-w-44 font-display text-xl font-black leading-tight">{course.title}</p>
            <span className="grid size-12 shrink-0 place-items-center rounded-control bg-white/20 text-sm font-black backdrop-blur">
              {course.instructor.avatarInitials}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-display text-xl font-extrabold leading-tight text-ink">{course.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-soft">{course.shortDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-ink-soft">
            <span>Rating {course.rating.toFixed(1)} ({course.reviewCount})</span>
            <span>{course.lessonCount} lessons</span>
            <span>{course.duration}</span>
            <span>{course.enrolledCount.toLocaleString()} enrolled</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Price</p>
            <p className="font-display text-2xl font-black text-ink">{course.priceSar} SAR</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => onPreview(course)}>
            Preview
          </Button>
        </div>
      </div>
    </article>
  );
}

export function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const routePathRef = useRef<SVGPathElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const featuredCourses = useMemo(() => courses.filter((course) => course.published && course.featured), []);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const scope = pageRef.current;
    if (!scope) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return undefined;
    }

    const context = gsap.context(() => {
      const routePath = routePathRef.current;
      if (routePath) {
        const routeLength = routePath.getTotalLength();
        gsap.set(routePath, {
          strokeDasharray: routeLength,
          strokeDashoffset: routeLength,
        });
      }

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero-kicker]', { y: 16, opacity: 0, duration: 0.55 })
        .from('[data-hero-title]', { y: 26, opacity: 0, duration: 0.7 }, '-=0.25')
        .from('[data-hero-copy]', { y: 18, opacity: 0, duration: 0.6 }, '-=0.35')
        .from('[data-hero-action]', { y: 16, opacity: 0, stagger: 0.08, duration: 0.45 }, '-=0.25')
        .from('[data-hero-panel]', { x: 36, opacity: 0, rotate: 1.5, duration: 0.85 }, '-=0.55')
        .to(routePath, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, '-=0.65')
        .from('[data-stat]', { y: 18, opacity: 0, stagger: 0.08, duration: 0.45 }, '-=0.5');

      gsap.to('[data-float-card]', {
        y: -10,
        duration: 2.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.25,
      });

      const sections = Array.from(scope.querySelectorAll<HTMLElement>('[data-animate-section]'));
      sections.forEach((section) => {
        const items = section.querySelectorAll('[data-animate-item]');
        gsap.from(items, {
          y: 34,
          opacity: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
          },
        });
      });
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen overflow-hidden bg-canvas-soft text-ink">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/30 bg-canvas-soft/82 backdrop-blur-xl">
        <div className="page-container flex min-h-16 items-center justify-between gap-6">
          <a className="font-display text-xl font-black tracking-normal text-ink" href="/" aria-label="QaderAcademy home">
            QaderAcademy
          </a>
          <nav className="hidden items-center gap-6 text-sm font-bold text-ink-soft md:flex" aria-label="Primary navigation">
            <a className="transition hover:text-brand-700" href="#features">
              Features
            </a>
            <a className="transition hover:text-brand-700" href="#top-courses">
              Courses
            </a>
            <a className="transition hover:text-brand-700" href="#testimonials">
              Stories
            </a>
          </nav>
          <Button size="sm" onClick={() => navigateTo('/login')}>
            Sign In
          </Button>
        </div>
      </header>

      <main>
        <section className="relative min-h-[calc(100vh-1px)] bg-canvas-warm pt-28 bottom-4rem">
          <div className="page-container relative grid gap-12 pb-16 lg:grid-cols-[2fr_1fr] lg:items-center lg:pb-24">
            <div className="max-w-3xl">
              <p className="eyebrow" data-hero-kicker>
                Practical learning for real progress
              </p>
              <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.8rem)] font-black leading-[0.9] tracking-normal text-ink" data-hero-title>
                Build skills that move your future forward.
              </h1>
              <p className="mt-6 max-w-reading text-lead text-ink-soft" data-hero-copy>
                QaderAcademy helps learners choose structured, career-relevant courses, practice through guided lessons, and prepare for measurable progress.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-hero-action>
                <Button size="lg" onClick={scrollToTopCourses}>
                  Explore top courses
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigateTo('/about')}>
                  Learn about QaderAcademy
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3" aria-label="Sample platform metrics">
                {stats.map((stat) => (
                  <div className="rounded-card border border-line bg-white/70 p-4 shadow-card" data-stat key={stat.label}>
                    <p className="font-display text-3xl font-black text-brand-700">{stat.value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[34rem]" data-hero-panel>
              <div className="absolute left-0 top-8 z-10 w-56 rounded-card border border-line bg-canvas p-4 shadow-lift" data-float-card>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-700">Path checkpoint</p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">Select a course, complete ordered lessons, and track what changed.</p>
              </div>

              <div className="absolute right-0 top-0 w-[72%] rounded-panel border border-line bg-canvas p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <Badge variant="brand">Featured plan</Badge>
                  <span className="text-xs font-bold text-ink-muted">Week 01</span>
                </div>
                <img className="mx-auto mt-7 w-44 opacity-95" src={heroImage} alt="" aria-hidden="true" />
                <div className="mt-7 space-y-3">
                  {['Choose the skill', 'Follow the lesson order', 'Prepare for assessment'].map((item) => (
                    <div className="flex items-center gap-3 rounded-control bg-canvas-warm px-3 py-2" key={item}>
                      <span className="size-2 rounded-full bg-brand-600" aria-hidden="true" />
                      <span className="text-sm font-bold text-ink-soft">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-0 left-10 w-64 rounded-card border border-line bg-[#eef3eb] p-5 shadow-card" data-float-card>
                <p className="font-display text-2xl font-black text-[#2f6f62]">6h 15m</p>
                <p className="mt-1 text-sm font-bold text-ink-soft">Sample course duration</p>
              </div>

              <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 520 520" fill="none" aria-hidden="true">
                <path
                  ref={routePathRef}
                  d="M58 132 C160 72 220 150 282 108 C374 46 470 112 430 204 C398 278 246 224 228 318 C210 418 340 456 444 386"
                  stroke="#d7263d"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </section>

        <section id="features" className="section-shell" data-animate-section>
          <div className="page-container">
            <div className="max-w-3xl" data-animate-item>
              <p className="eyebrow">Platform model</p>
              <h2 className="mt-3 font-display text-heading-lg">Designed around a clear learning journey.</h2>
              <p className="mt-4 body-copy">
                The first public release presents the learning model, course catalog, and contact path while future enrollment features are prepared.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <article className="rounded-card border border-line bg-canvas p-6 shadow-card" data-animate-item key={feature.title}>
                  <span className="grid size-12 place-items-center rounded-control bg-brand-50 font-display text-lg font-black text-brand-700">
                    {feature.icon}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-extrabold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="top-courses" className="section-shell bg-canvas" data-animate-section>
          <div className="page-container">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between" data-animate-item>
              <div className="max-w-2xl">
                <p className="eyebrow">Top courses</p>
                <h2 className="mt-3 font-display text-heading-lg">Start with a practical skill path.</h2>
                <p className="mt-4 body-copy">
                  Featured courses are sample catalog entries shaped around the domain model. Enrollment actions remain clearly marked until launch.
                </p>
              </div>
              <Badge variant="warning" size="md">
                Sample catalog
              </Badge>
            </div>

            {featuredCourses.length > 0 ? (
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {featuredCourses.map((course) => (
                  <CourseCard course={course} onPreview={setSelectedCourse} key={course.id} />
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-card border border-dashed border-line-strong bg-canvas-soft p-8 text-center" data-animate-item>
                <h3 className="font-display text-heading-sm">No featured courses yet.</h3>
                <p className="mt-2 text-ink-soft">Published featured courses will appear here when the catalog is ready.</p>
              </div>
            )}
          </div>
        </section>

        <section id="testimonials" className="section-shell" data-animate-section>
          <div className="page-container">
            <div className="max-w-2xl" data-animate-item>
              <p className="eyebrow">Learner stories</p>
              <h2 className="mt-3 font-display text-heading-lg">Reserved for approved testimonials.</h2>
              <p className="mt-4 body-copy">
                No unverifiable outcomes are shown here. These placeholders make the production content requirement visible.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {/* Replace these placeholders with approved testimonials before production. */}
              {testimonials.map((testimonial) => (
                <article className="rounded-card border border-line bg-canvas p-6 shadow-card" data-animate-item key={testimonial.name}>
                  <Badge variant="outline">Placeholder</Badge>
                  <p className="mt-5 text-base leading-7 text-ink-soft">"{testimonial.quote}"</p>
                  <div className="mt-6 border-t border-line pt-5">
                    <p className="font-bold text-ink">{testimonial.name}</p>
                    <p className="text-sm text-ink-muted">{testimonial.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-canvas-dark py-16 text-white md:py-24" data-animate-section>
          <div className="page-container">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div data-animate-item>
                <p className="eyebrow text-brand-300">Next step</p>
                <h2 className="mt-3 max-w-3xl font-display text-heading-lg text-white">Ready to choose your next skill?</h2>
                <p className="mt-4 max-w-reading text-white/70">
                  Tell the team what you want to learn, and they can point you toward the best course path when enrollment opens.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end" data-animate-item>
                <Button size="lg" onClick={() => navigateTo('/contact')}>
                  Talk to our team
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigateTo('/about')}>
                  See how the platform works
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-canvas py-10">
        <div className="page-container grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <p className="font-display text-xl font-black">QaderAcademy</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">
              Practical learning paths for learners preparing for their next professional step.
            </p>
          </div>
          <div className="grid gap-2 text-sm font-bold text-ink-soft sm:grid-cols-2 md:text-right">
            <a className="hover:text-brand-700" href="#top-courses">
              Course categories
            </a>
            <a className="hover:text-brand-700" href="/contact">
              Contact details
            </a>
            <span aria-disabled="true">Privacy coming soon</span>
            <span aria-disabled="true">Terms coming soon</span>
          </div>
          <p className="text-sm text-ink-muted md:col-span-2">Copyright {currentYear} QaderAcademy. All rights reserved.</p>
        </div>
      </footer>

      <Modal
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title ?? 'Course preview'}
        description="Sample course preview. Enrollment is not active in this frontend release."
      >
        {selectedCourse ? (
          <div className="grid gap-6 md:grid-cols-[0.8fr_1fr]">
            <div className={cn('min-h-56 rounded-card bg-linear-to-br p-5 text-white', thumbnailClasses[selectedCourse.thumbnailTone])}>
              <Badge variant="outline" className="bg-white/18 text-white ring-white/35">
                {selectedCourse.category}
              </Badge>
              <p className="mt-16 font-display text-3xl font-black leading-tight">{selectedCourse.title}</p>
            </div>
            <div>
              <p className="leading-7 text-ink-soft">{selectedCourse.shortDescription}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-bold text-ink-muted">Instructor</dt>
                  <dd className="mt-1 font-bold text-ink">{selectedCourse.instructor.name}</dd>
                </div>
                <div>
                  <dt className="font-bold text-ink-muted">Duration</dt>
                  <dd className="mt-1 font-bold text-ink">{selectedCourse.duration}</dd>
                </div>
                <div>
                  <dt className="font-bold text-ink-muted">Lessons</dt>
                  <dd className="mt-1 font-bold text-ink">{selectedCourse.lessonCount}</dd>
                </div>
                <div>
                  <dt className="font-bold text-ink-muted">Price</dt>
                  <dd className="mt-1 font-bold text-ink">{selectedCourse.priceSar} SAR</dd>
                </div>
              </dl>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => navigateTo(`/contact?course=${selectedCourse.slug}`)}>Ask about enrollment</Button>
                <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                  Enrollment coming soon
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
