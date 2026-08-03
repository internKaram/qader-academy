import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { InstructorShell } from '../../components/instructor/InstructorShell';
import { Badge, Button, Card, Input } from '../../components/ui';
import { getInstructorCourse } from '../../data/instructorDashboard';

export function InstructorCourseEditorPage() {
  const { courseId } = useParams();
  const course = getInstructorCourse(courseId);

  if (!course) {
    return (
      <InstructorShell
        title="Course not found"
        description="This mock instructor workspace only exposes courses owned by the current instructor."
        action={
          <Link to="/instructor/courses">
            <Button leadingIcon={<ArrowLeft className="size-4" />} variant="outline">
              Back to courses
            </Button>
          </Link>
        }
      >
        <Card variant="surface">
          <h2 className="font-display text-heading-sm text-ink">No editable course matched this route.</h2>
          <p className="mt-3 text-sm leading-6 text-ink-soft">Choose a course from the instructor course list to continue editing.</p>
        </Card>
      </InstructorShell>
    );
  }

  return (
    <InstructorShell
      title="Edit course and lessons"
      description="Update the course metadata and lesson sequence. Draft autosave is represented as a mock state for this frontend-only pass."
      action={
        <Link to="/instructor/courses">
          <Button leadingIcon={<ArrowLeft className="size-4" />} variant="outline">
            Back to courses
          </Button>
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form className="space-y-6">
          <Card variant="surface">
            <Card.Header>
              <Badge dot variant={course.status === 'published' ? 'success' : 'warning'}>
                {course.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
              <h2 className="font-display text-heading-sm text-ink">Course metadata</h2>
            </Card.Header>
            <Card.Body>
              <Input label="Title" defaultValue={course.title} required />
              <Input label="Description" defaultValue={course.description} multiline required />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="Category" defaultValue={course.category} required />
                <Input label="Thumbnail" defaultValue={course.thumbnail} required />
                <Input label="Status" defaultValue={course.status} readOnly />
              </div>
            </Card.Body>
            <Card.Footer>
              <Button leadingIcon={<Save className="size-4" />}>Save course mock</Button>
              <Button variant="outline">Save draft</Button>
            </Card.Footer>
          </Card>

          <section className="space-y-4">
            <div>
              <h2 className="font-display text-heading-sm text-ink">Lessons</h2>
              <p className="mt-1 text-sm text-ink-muted">Each lesson keeps the SRS fields: title, video URL, text content, duration, and order.</p>
            </div>
            {course.lessons.map((lesson) => (
              <Card variant="surface" key={lesson.id}>
                <Card.Header>
                  <Badge variant="outline">Lesson {lesson.order}</Badge>
                  <h3 className="font-display text-xl font-black text-ink">{lesson.title}</h3>
                </Card.Header>
                <Card.Body>
                  <Input label="Lesson title" defaultValue={lesson.title} required />
                  <Input label="Video URL" defaultValue={lesson.videoUrl} required />
                  <Input label="Text content" defaultValue={lesson.textContent} multiline required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Duration minutes" defaultValue={String(lesson.durationMinutes)} type="number" required />
                    <Input label="Order" defaultValue={String(lesson.order)} type="number" required />
                  </div>
                </Card.Body>
              </Card>
            ))}
          </section>
        </form>

        <aside className="space-y-5">
          <Card variant="dark">
            <h2 className="font-display text-heading-sm text-white">Draft autosave</h2>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Mock status: saved locally 2 minutes ago. The SRS expects authoring screens to avoid lost work on accidental navigation.
            </p>
          </Card>
          <Card variant="surface">
            <h2 className="font-display text-heading-sm text-ink">Next step</h2>
            <p className="mt-3 text-sm leading-6 text-ink-soft">After lesson edits, review the quiz attached to this course.</p>
            <Link className="mt-5 inline-flex" to={`/instructor/courses/${course.id}/quiz`}>
              <Button size="sm" variant="outline">
                Open quiz builder
              </Button>
            </Link>
          </Card>
        </aside>
      </div>
    </InstructorShell>
  );
}
