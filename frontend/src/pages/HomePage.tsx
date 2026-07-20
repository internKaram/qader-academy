import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, BookOpen, Clock, Users } from 'lucide-react';
import aboutTeacherImage from '../assets/about-teacher.webp';
import heroLearnersImage from '../assets/hero-learners.webp';
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
    description: 'Instructor-authored learning paths built around practical, real-world examples.',
  },
  {
    icon: '02',
    title: 'Structured lessons',
    description: 'Ordered lessons, resources, and checkpoints so learners always know what comes next.',
  },
  {
    icon: '03',
    title: 'Assessments',
    description: 'Quizzes, completion tracking, and progress records in one place.',
  },
  {
    icon: '04',
    title: 'Shareable certificates',
    description: 'Course certificates earned after completing all requirements.',
  },
];

const testimonials = [
  {
    name: 'Layla Al-Othman',
    role: 'Career switcher',
    quote: 'The structured lessons helped me transition from teaching to data analysis in just six months.',
    avatarInitials: 'LA',
  },
  {
    name: 'Sami Al-Rashid',
    role: 'Course author',
    quote: 'I use the course material every week when designing new learning paths for my students.',
    avatarInitials: 'SR',
  },
  {
    name: 'Hind Al-Saud',
    role: 'Training partner',
    quote: 'Our team adopted the platform for internal training — the progress tracking alone saves us hours each week.',
    avatarInitials: 'HS',
  },
];

const thumbnailClasses: Record<Course['thumbnailTone'], string> = {
  red: 'from-brand-600 via-brand-500 to-[#f7b2a6]',
  green: 'from-[#2f6f62] via-[#6fa18f] to-[#c8d7b8]',
  gold: 'from-[#a96f1f] via-[#d7a64a] to-[#f3d89b]',
  ink: 'from-ink via-[#354052] to-[#a9b3c1]',
};

const categoryBadgeClasses: Record<string, string> = {
  Frontend: '!bg-[#fff1f2] !text-brand-700 !ring-brand-200',
  Data: '!bg-[#e7f6f1] !text-[#236455] !ring-[#9fd4c1]',
  Career: '!bg-[#fff6dc] !text-[#8a5a12] !ring-[#f2cf70]',
  Product: '!bg-[#eef2ff] !text-[#34418a] !ring-[#b9c4ff]',
  Draft: '!bg-canvas-warm !text-ink-muted !ring-line-strong',
};

function getCategoryBadgeClass(category: string) {
  return categoryBadgeClasses[category] ?? '!bg-white !text-ink !ring-white/50';
}

function scrollToTopCourses() {
  document.getElementById('top-courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToFeatures() {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function navigateTo(path: string) {
  window.location.href = path;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

function CourseCard({ course, onPreview }: { course: Course; onPreview: (course: Course) => void }) {
  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      data-animate-item
    >
      <div className={cn('relative min-h-44 overflow-hidden bg-linear-to-br p-5 text-white', thumbnailClasses[course.thumbnailTone])}>
        <img
          className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
          src={course.thumbnailImage}
          alt=""
          width="900"
          height="540"
          loading="lazy"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink/88 via-ink/34 to-ink/10" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(120deg,transparent_0_38%,rgba(255,255,255,.55)_38%_40%,transparent_40%_100%)]" />
        <div className="relative">
          <Badge variant="outline" className={cn('w-fit shadow-card', getCategoryBadgeClass(course.category))}>
            {course.category}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-extrabold leading-tight text-ink">{course.title}</h3>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-black text-brand-600">
            {course.instructor.avatarInitials}
          </span>
        </div>
        <div className="flex-1 mt-3">
          <p className="text-sm leading-6 text-ink-soft">{course.shortDescription}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5">
            <Star className="size-4" />
            {course.rating.toFixed(1)} ({course.reviewCount})
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4" />
            {course.lessonCount} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {formatCompact(course.enrolledCount)} enrolled
          </span>
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
        const items = Array.from(section.querySelectorAll<HTMLElement>('[data-animate-item]'));

        ScrollTrigger.create({
          trigger: section,
          start: 'top 78%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              items,
              { y: 34, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.75,
                stagger: 0.1,
                ease: 'power3.out',
                clearProps: 'transform,opacity,visibility',
              },
            );
          },
        });
      });

      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen overflow-x-hidden bg-canvas-soft text-ink">
      <header className="fixed inset-x-0 top-0 z-40 bg-white/90 shadow-[0_10px_30px_rgb(18_24_38_/_0.06)] backdrop-blur-xl">
        <div className="page-container flex min-h-18 items-center justify-between gap-6">
          <a className="font-display text-xl font-black tracking-normal text-ink" href="/" aria-label="QaderAcademy home">
            QaderAcademy
          </a>
          <nav className="hidden items-center gap-6 text-sm font-bold text-ink-soft md:flex" aria-label="Primary navigation">
            <a className="transition hover:text-brand-700" href="#features">
              About
            </a>
            <a className="transition hover:text-brand-700" href="#top-courses">
              Courses
            </a>
            <a className="transition hover:text-brand-700" href="#contact">
              Contact
            </a>
          </nav>
          <Button size="sm" onClick={() => navigateTo('/login')} style={{
            backgroundColor: '#3b635a',
            boxShadow: '0 4px 12px rgba(59, 99, 90, 0.3)',
          }}>
            Sign In
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#fff7f3] pt-28">
          <div className="absolute -left-24 top-18 size-64 rounded-full bg-[#fee8df]" aria-hidden="true" />
          <div className="absolute right-8 top-24 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <span className="size-1.5 rounded-full bg-brand-400" key={index} />
            ))}
          </div>
          <div className="absolute bottom-18 left-1/2 h-24 w-24 rounded-full border-[18px] border-[#e9f7f1]" aria-hidden="true" />

          <div className="page-container relative grid gap-12 pb-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1.08fr)] lg:items-center lg:pb-28">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-600" data-hero-kicker>
                Practical learning for real progress
              </p>
              <h1 className="mt-5 font-display text-[clamp(2.25rem,7vw,5.1rem)] font-black leading-[0.95] tracking-normal text-ink" data-hero-title>
                Build skills that move your future forward.
              </h1>
              <p className="mt-6 max-w-reading text-base leading-8 text-ink-soft" data-hero-copy>
                Structured, career-relevant courses with guided lessons and measurable progress.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-hero-action>
                <Button size="lg" onClick={scrollToTopCourses}>
                  Start Learning
                </Button>
                <Button size="lg" variant="ghost" onClick={scrollToFeatures}>
                  Learn more
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Sample platform metrics">
                {stats.map((stat) => (
                  <div className="rounded-card bg-white p-4 shadow-card" data-stat key={stat.label}>
                    <p className="font-display text-3xl font-black text-brand-600">{stat.value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative isolate min-h-[36rem]" data-hero-panel>
              <div className="absolute left-1/2 top-8 size-[28rem] -translate-x-1/2 rounded-full bg-[#59c3a5]" />
              <div className="absolute left-1/2 top-2 size-[22rem] -translate-x-1/2 rounded-full border-[18px] border-white/70" />
              <div className="absolute left-[11%] top-24 size-16 rounded-full bg-[#ffd9a8]" data-float-card />
              <div className="absolute right-[6%] top-18 size-9 rounded-full bg-brand-300" data-float-card />
              <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 620 520" fill="none" aria-hidden="true">
                <path
                  ref={routePathRef}
                  d="M62 390 C116 330 98 250 172 236 C250 220 276 310 350 282 C428 252 446 150 550 126"
                  stroke="#d7263d"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M500 96 C530 74 558 78 580 104"
                  stroke="#f2b45b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute left-1/2 top-10 z-20 w-[min(90%,27rem)] -translate-x-1/2 overflow-hidden rounded-[3rem] border-[10px] border-white bg-white shadow-lift">
                <img
                  className="aspect-[4/5] h-full w-full object-cover object-center"
                  src={heroLearnersImage}
                  alt="Two adult learners studying together with a laptop"
                />
              </div>

              <div className="absolute bottom-20 left-4 z-30 rounded-card bg-white p-4 shadow-lift" data-float-card>
                <p className="font-display text-3xl font-black text-brand-600">25K+</p>
                <p className="text-sm font-bold text-ink-soft">Sample learners</p>
              </div>

              <div className="absolute right-0 top-24 z-30 rounded-card bg-white p-4 shadow-card" data-float-card>
                <Badge variant="success">Live class</Badge>
                <p className="mt-2 text-sm font-bold text-ink-soft">Guided lessons</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section-shell bg-canvas" data-animate-section>
          <div className="page-container grid gap-12 lg:grid-cols-[1.0fr_1.0fr] lg:items-center">
            <div className="relative min-h-[38rem]" data-animate-item>
              <div className="absolute left-4 top-8 h-[31rem] w-[22rem] overflow-hidden rounded-panel bg-[#e7f6f1] shadow-card">
                <img
                  className="h-full w-full object-cover object-[52%_18%]"
                  src={aboutTeacherImage}
                  alt="Teacher presenting an online lesson with a tablet"
                />
              </div>
              <div className="absolute bottom-12 right-10 w-60 rounded-card bg-white p-4 shadow-lift">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-brand-50 font-black text-brand-600">4.8</span>
                  <div>
                    <p className="font-bold text-ink">Trusted lessons</p>
                    <p className="text-sm text-ink-muted">Average clients' experience</p>
                  </div>
                </div>
              </div>
            </div>

            <div data-animate-item>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-brand-600">About QaderAcademy</p>
              <h2 className="mt-3 font-display text-heading-lg">You can learn anything, anytime, from anywhere.</h2>
              <p className="mt-5 body-copy">
                Practical, career-relevant learning — courses, lessons, assessments, and certificates in one clear journey.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <article className="rounded-card border border-line bg-canvas-soft p-4" data-animate-item key={feature.title}>
                    <span className="grid size-9 place-items-center rounded-full bg-brand-600 text-sm font-black text-white">{feature.icon}</span>
                    <h3 className="mt-4 font-display text-lg font-extrabold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">{feature.description}</p>
                  </article>
                ))}
              </div>
              {/* <Button className="mt-8" onClick={() => navigateTo('/about')}>
                Learn more
              </Button> */}
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
                  Sample catalog entries shaped around real learning paths.
                </p>
              </div>
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
              <h2 className="mt-3 font-display text-heading-lg">What our learners say.</h2>
              <p className="mt-4 body-copy">
                Placeholders awaiting approved learner stories.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article className="rounded-card border border-line bg-canvas p-6 shadow-card" data-animate-item key={testimonial.name}>
                  <p className="text-base leading-7 text-ink-soft">"{testimonial.quote}"</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-black text-brand-600">
                      {testimonial.avatarInitials}
                    </span>
                    <div>
                      <p className="font-bold text-ink">{testimonial.name}</p>
                      <p className="text-sm text-ink-muted">{testimonial.role}</p>
                    </div>
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
                  Find the right path for your goals.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end" data-animate-item>
                <Button size="lg" onClick={() => navigateTo('/courses')}>
                  Browse courses
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-canvas-dark pt-14 text-white" id='contact'>
        <div className="page-container">
          <div className="grid gap-10 border-b border-white/12 pb-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1fr]">
            <div>
              <a className="font-display text-2xl font-black text-white" href="/" aria-label="QaderAcademy home">
                QaderAcademy
              </a>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/68">
                Practical learning paths for career-relevant skills.
              </p>
              {/* <div className="mt-6 flex gap-3" aria-label="Social links">
                {['in', 'x', 'yt'].map((item) => (
                  <a
                    className="grid size-10 place-items-center rounded-full border border-white/18 text-xs font-black uppercase text-white/72 transition hover:border-brand-300 hover:bg-brand-600 hover:text-white"
                    href="#"
                    aria-label={`${item} placeholder link`}
                    key={item}
                  >
                    {item}
                  </a>
                ))}
              </div> */}
            </div>

            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">Learn</h2>
              <nav className="mt-4 grid gap-3 text-sm font-bold text-white/68" aria-label="Course categories">
                <a className="transition hover:text-white" href="#top-courses">
                  Featured courses
                </a>
                <a className="transition hover:text-white" href="#top-courses">
                  Frontend development
                </a>
                <a className="transition hover:text-white" href="#top-courses">
                  Data analysis
                </a>
                <a className="transition hover:text-white" href="#top-courses">
                  Career communication
                </a>
              </nav>
            </div>

            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">Company</h2>
              <nav className="mt-4 grid gap-3 text-sm font-bold text-white/68" aria-label="Company navigation">
                <a className="transition hover:text-white" href="#features">
                  About
                </a>
                <a className="transition hover:text-white" href="#testimonials">
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

      <Modal
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.title ?? 'Course preview'}
        description="Sample course preview. Enrollment is not active in this frontend release."
      >
        {selectedCourse ? (
          <div className="grid gap-6 md:grid-cols-[0.8fr_1fr]">
            <div className={cn('relative min-h-56 overflow-hidden rounded-card bg-linear-to-br p-5 text-white', thumbnailClasses[selectedCourse.thumbnailTone])}>
              <img className="absolute inset-0 h-full w-full object-cover" src={selectedCourse.thumbnailImage} alt="" width="900" height="540" aria-hidden="true" />
              <div className="absolute inset-0 bg-linear-to-t from-ink/88 via-ink/36 to-ink/8" />
              <div className="relative">
                <Badge variant="outline" className={cn('shadow-card', getCategoryBadgeClass(selectedCourse.category))}>
                  {selectedCourse.category}
                </Badge>
                <p className="mt-16 font-display text-3xl font-black leading-tight">{selectedCourse.title}</p>
              </div>
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
