import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { InstructorShell } from '../../components/instructor/InstructorShell';
import { Badge, Button, Card, Input } from '../../components/ui';
import { getInstructorCourse } from '../../data/instructorDashboard';

export function InstructorQuizBuilderPage() {
  const { courseId } = useParams();
  const course = getInstructorCourse(courseId);

  if (!course) {
    return (
      <InstructorShell
        title="Quiz not found"
        description="Quiz builder routes are only available for courses owned by this instructor in the mock data."
        action={
          <Link to="/instructor/courses">
            <Button leadingIcon={<ArrowLeft className="size-4" />} variant="outline">
              Back to courses
            </Button>
          </Link>
        }
      >
        <Card variant="surface">
          <h2 className="font-display text-heading-sm text-ink">No course matched this quiz route.</h2>
          <p className="mt-3 text-sm leading-6 text-ink-soft">Choose a course from the instructor course list before editing a quiz.</p>
        </Card>
      </InstructorShell>
    );
  }

  return (
    <InstructorShell
      title="Quiz builder"
      description={`Create and review multiple-choice questions for ${course.title}.`}
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
              <Badge variant="brand">Quiz setup</Badge>
              <h2 className="font-display text-heading-sm text-ink">{course.quiz.title}</h2>
            </Card.Header>
            <Card.Body>
              <Input label="Quiz title" defaultValue={course.quiz.title} required />
              <Input label="Passing score" defaultValue={String(course.quiz.passingScore)} type="number" required />
            </Card.Body>
          </Card>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-heading-sm text-ink">Questions</h2>
                <p className="mt-1 text-sm text-ink-muted">MCQ questions use four options and a correct answer index.</p>
              </div>
              <Button size="sm" variant="outline" leadingIcon={<Plus className="size-4" />}>
                Add question mock
              </Button>
            </div>

            {course.quiz.questions.map((question, questionIndex) => (
              <Card variant="surface" key={question.id}>
                <Card.Header>
                  <Badge variant="outline">Question {questionIndex + 1}</Badge>
                  <h3 className="font-display text-xl font-black text-ink">{question.text}</h3>
                </Card.Header>
                <Card.Body>
                  <Input label="Question text" defaultValue={question.text} required />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <Input
                        key={`${question.id}-${option}`}
                        label={`Option ${optionIndex + 1}`}
                        defaultValue={option}
                        required
                        hint={optionIndex === question.correctIndex ? 'Marked as the correct option.' : undefined}
                      />
                    ))}
                  </div>
                  <Input label="Correct index" defaultValue={String(question.correctIndex)} type="number" required />
                </Card.Body>
              </Card>
            ))}
          </section>

          <div className="flex flex-wrap gap-3">
            <Button leadingIcon={<Save className="size-4" />}>Save quiz mock</Button>
            <Button variant="outline">Preview as student</Button>
          </div>
        </form>

        <aside className="space-y-5">
          <Card variant="dark">
            <h2 className="font-display text-heading-sm text-white">Quiz rules</h2>
            <p className="mt-3 text-sm leading-6 text-white/72">
              The SRS requires quiz title, passing score, multiple-choice questions, four options, and correct index.
            </p>
          </Card>
          <Card variant="surface">
            <h2 className="font-display text-heading-sm text-ink">Course context</h2>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{course.title}</p>
            <p className="mt-2 text-sm text-ink-muted">{course.quizQuestionCount} planned quiz items</p>
          </Card>
        </aside>
      </div>
    </InstructorShell>
  );
}
