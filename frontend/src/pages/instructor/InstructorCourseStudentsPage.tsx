import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Users } from 'lucide-react';
import { InstructorShell } from '../../components/instructor/InstructorShell';
import { Badge, Button, Card, Table, type TableColumn } from '../../components/ui';
import { getCourseLearners, getInstructorCourse, type CourseLearner } from '../../data/instructorDashboard';

function learnerStatusVariant(status: CourseLearner['status']) {
  if (status === 'completed') return 'success';
  if (status === 'needs_review') return 'warning';
  return 'info';
}

const learnerColumns: TableColumn<CourseLearner>[] = [
  {
    key: 'name',
    header: 'Learner',
    accessor: (learner) => (
      <div>
        <p className="font-bold text-ink">{learner.name}</p>
        <p className="text-xs text-ink-muted">{learner.email}</p>
      </div>
    ),
  },
  {
    key: 'progress',
    header: 'Progress',
    accessor: (learner) => (
      <div className="flex min-w-40 items-center gap-3">
        <div className="h-2 flex-1 rounded-pill bg-canvas-warm">
          <div className="h-2 rounded-pill bg-brand-600" style={{ width: `${learner.progress}%` }} />
        </div>
        <span className="w-10 text-right font-semibold text-ink">{learner.progress}%</span>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (learner) => (
      <Badge dot variant={learnerStatusVariant(learner.status)}>
        {learner.status === 'needs_review' ? 'Needs review' : learner.status}
      </Badge>
    ),
  },
  { key: 'lastActive', header: 'Last active', accessor: 'lastActive', align: 'right' },
  {
    key: 'certificate',
    header: 'Certificate',
    accessor: (learner) => (
      <Badge variant={learner.certificate === 'earned' ? 'brand' : 'neutral'}>
        {learner.certificate === 'earned' ? 'Earned' : 'Not yet'}
      </Badge>
    ),
  },
];

export function InstructorCourseStudentsPage() {
  const { courseId } = useParams();
  const course = getInstructorCourse(courseId);
  const learners = getCourseLearners(courseId);
  const completedCount = learners.filter((learner) => learner.status === 'completed').length;
  const certificateCount = learners.filter((learner) => learner.certificate === 'earned').length;

  if (!course) {
    return (
      <InstructorShell
        title="Course students not found"
        description="Students are only visible after selecting a course owned by this instructor."
        action={
          <Link to="/instructor/courses">
            <Button leadingIcon={<ArrowLeft className="size-4" />} variant="outline">
              Back to courses
            </Button>
          </Link>
        }
      >
        <Card variant="surface">
          <h2 className="font-display text-heading-sm text-ink">No selected course exists for this route.</h2>
          <p className="mt-3 text-sm leading-6 text-ink-soft">Use the course list and choose View students from a specific course.</p>
        </Card>
      </InstructorShell>
    );
  }

  return (
    <InstructorShell
      title="Course students"
      description={`Learners enrolled in ${course.title}. This is intentionally course-scoped and does not expose a global student list.`}
      action={
        <Link to="/instructor/courses">
          <Button leadingIcon={<ArrowLeft className="size-4" />} variant="outline">
            Back to courses
          </Button>
        </Link>
      }
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Card variant="surface">
          <Users className="size-6 text-brand-700" />
          <p className="mt-4 text-sm font-bold text-ink-muted">Enrolled in this course</p>
          <p className="mt-2 font-display text-4xl font-black text-ink">{learners.length}</p>
        </Card>
        <Card variant="surface">
          <Award className="size-6 text-brand-700" />
          <p className="mt-4 text-sm font-bold text-ink-muted">Completed</p>
          <p className="mt-2 font-display text-4xl font-black text-ink">{completedCount}</p>
        </Card>
        <Card variant="surface">
          <Award className="size-6 text-brand-700" />
          <p className="mt-4 text-sm font-bold text-ink-muted">Certificates earned</p>
          <p className="mt-2 font-display text-4xl font-black text-ink">{certificateCount}</p>
        </Card>
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="font-display text-heading-sm text-ink">{course.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">Course-scoped learner records.</p>
        </div>
        <Table
          caption={`Students enrolled in ${course.title}`}
          columns={learnerColumns}
          rows={learners}
          rowKey="id"
          emptyMessage="No learners are enrolled in this course yet."
        />
      </section>
    </InstructorShell>
  );
}
