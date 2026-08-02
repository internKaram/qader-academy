import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Users } from 'lucide-react';
import { SiteFooter, SiteHeader } from '../components/SiteChrome';
import { Badge, Button, Card } from '../components/ui';
import { instructorCourses, instructorProfile } from '../data/instructorDashboard';

const publishedCourses = instructorCourses.filter((course) => course.status === 'published');
const totalLearners = publishedCourses.reduce((sum, course) => sum + course.enrolledCount, 0);
const totalLessons = publishedCourses.reduce((sum, course) => sum + course.lessonCount, 0);

export function InstructorPublicPage() {
  return (
    <div className="min-h-screen bg-canvas-soft text-ink">
      <SiteHeader />
      <main className="pt-28 pb-16">
        <section className="page-container">
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
            <div>
              <Badge variant="brand">Instructor profile</Badge>
              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="grid size-20 shrink-0 place-items-center rounded-full bg-brand-50 text-2xl font-black text-brand-700 ring-1 ring-brand-200">
                  {instructorProfile.avatarInitials}
                </span>
                <div>
                  <h1 className="font-display text-heading-lg text-ink">{instructorProfile.name}</h1>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-ink-soft">{instructorProfile.bio}</p>
                </div>
              </div>
            </div>

            <Card variant="surface" className="h-fit">
              <Card.Header>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Public stats</p>
              </Card.Header>
              <Card.Body>
                <div className="grid gap-3">
                  <p className="flex items-center justify-between gap-4 text-sm font-bold text-ink-soft">
                    <span className="inline-flex items-center gap-2">
                      <BookOpen className="size-4 text-brand-700" />
                      Published courses
                    </span>
                    <span className="text-ink">{publishedCourses.length}</span>
                  </p>
                  <p className="flex items-center justify-between gap-4 text-sm font-bold text-ink-soft">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-success" />
                      Lessons
                    </span>
                    <span className="text-ink">{totalLessons}</span>
                  </p>
                  <p className="flex items-center justify-between gap-4 text-sm font-bold text-ink-soft">
                    <span className="inline-flex items-center gap-2">
                      <Users className="size-4 text-info" />
                      Learners
                    </span>
                    <span className="text-ink">{totalLearners}</span>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </section>

        <section className="page-container mt-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-heading-sm text-ink">Courses by {instructorProfile.name}</h2>
              <p className="mt-1 text-sm text-ink-muted">Published courses visible to learners.</p>
            </div>
            <Link to="/courses">
              <Button size="sm" variant="outline">
                Browse catalog
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {publishedCourses.map((course) => (
              <Card key={course.id} variant="surface" className="flex h-full flex-col">
                <Card.Header>
                  <Badge variant="neutral">{course.category}</Badge>
                  <h3 className="font-display text-heading-sm text-ink">{course.title}</h3>
                </Card.Header>
                <Card.Body>
                  <p className="line-clamp-2 text-sm leading-6 text-ink-soft">{course.description}</p>
                </Card.Body>
                <Card.Footer className="mt-auto items-center justify-between">
                  <span className="text-sm font-bold text-ink-muted">{course.lessonCount} lessons</span>
                  <Link to="/courses">
                    <Button size="sm" variant="outline">
                      View catalog
                    </Button>
                  </Link>
                </Card.Footer>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter sectionBasePath="/" />
    </div>
  );
}
