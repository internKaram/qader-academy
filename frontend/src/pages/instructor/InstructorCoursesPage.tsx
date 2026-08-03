import { Link } from 'react-router-dom';
import { Eye, FilePenLine, ListChecks, Plus, Users } from 'lucide-react';
import { InstructorShell } from '../../components/instructor/InstructorShell';
import { Badge, Button, Card } from '../../components/ui';
import { instructorCourses, type InstructorCourse } from '../../data/instructorDashboard';

function statusVariant(status: InstructorCourse['status']) {
  return status === 'published' ? 'success' : 'warning';
}

export function InstructorCoursesPage() {
  return (
    <InstructorShell
      title="Instructor courses"
      description="Review the courses you own, continue authoring drafts, manage lessons and quizzes, or inspect learners within a selected course."
      action={
        <Link to="/instructor/courses/new">
          <Button leadingIcon={<Plus className="size-4" />}>New course</Button>
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {instructorCourses.map((course) => (
          <article className="rounded-card border border-line bg-canvas p-6 shadow-card" key={course.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge dot variant={statusVariant(course.status)}>
                  {course.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
                <h2 className="mt-4 font-display text-heading-sm text-ink">{course.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{course.description}</p>
              </div>
              <span className="shrink-0 rounded-control bg-canvas-warm px-3 py-2 text-sm font-black text-ink-soft">
                {course.category}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Card variant="soft" padding="sm">
                <p className="text-xs font-bold uppercase text-ink-muted">Lessons</p>
                <p className="mt-1 font-display text-2xl font-black text-ink">{course.lessonCount}</p>
              </Card>
              <Card variant="soft" padding="sm">
                <p className="text-xs font-bold uppercase text-ink-muted">Learners</p>
                <p className="mt-1 font-display text-2xl font-black text-ink">{course.enrolledCount}</p>
              </Card>
              <Card variant="soft" padding="sm">
                <p className="text-xs font-bold uppercase text-ink-muted">Quiz items</p>
                <p className="mt-1 font-display text-2xl font-black text-ink">{course.quizQuestionCount}</p>
              </Card>
              <Card variant="soft" padding="sm">
                <p className="text-xs font-bold uppercase text-ink-muted">Complete</p>
                <p className="mt-1 font-display text-2xl font-black text-ink">{course.completionRate}%</p>
              </Card>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
              <Link to={`/instructor/courses/${course.id}/edit`}>
                <Button size="sm" variant="outline" leadingIcon={<FilePenLine className="size-4" />}>
                  Edit
                </Button>
              </Link>
              <Link to={`/instructor/courses/${course.id}/quiz`}>
                <Button size="sm" variant="outline" leadingIcon={<ListChecks className="size-4" />}>
                  Quiz
                </Button>
              </Link>
              <Link to={`/instructor/courses/${course.id}/students`}>
                <Button size="sm" variant="outline" leadingIcon={<Users className="size-4" />}>
                  View students
                </Button>
              </Link>
              <Button size="sm" variant="ghost" leadingIcon={<Eye className="size-4" />} disabled>
                Preview mock
              </Button>
            </div>
          </article>
        ))}
      </div>
    </InstructorShell>
  );
}
