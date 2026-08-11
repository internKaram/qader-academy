import { Save, Send } from 'lucide-react';
import { InstructorShell } from '../../components/instructor/InstructorShell';
import { Badge, Button, Card, Input } from '../../components/ui';

export function InstructorCourseWizardPage() {
  return (
    <InstructorShell
      title="Create a course"
      description="Mock course authoring wizard for the SRS course creation flow. These fields mirror the MVP course shape and do not persist yet."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form className="space-y-6">
          <Card variant="surface">
            <Card.Header>
              <Badge variant="brand">Step 1</Badge>
              <h2 className="font-display text-heading-sm text-ink">Course details</h2>
            </Card.Header>
            <Card.Body>
              <Input label="Course title" defaultValue="New practical learning path" required />
              <Input label="Description" defaultValue="Describe what learners will be able to do after completing this course." multiline required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Category" defaultValue="Frontend" required />
                <Input label="Thumbnail file name" defaultValue="course-thumbnail.webp" required />
              </div>
            </Card.Body>
          </Card>

          <Card variant="surface">
            <Card.Header>
              <Badge variant="brand">Step 2</Badge>
              <h2 className="font-display text-heading-sm text-ink">Publish state</h2>
            </Card.Header>
            <Card.Body>
              <fieldset className="grid gap-3 sm:grid-cols-2">
                <legend className="sr-only">Publish state</legend>
                <label className="rounded-control border border-brand-200 bg-brand-50 p-4">
                  <input className="mr-2 accent-brand-600" defaultChecked name="publish-state" type="radio" />
                  <span className="font-bold text-brand-700">Save as draft</span>
                  <p className="mt-2 text-sm text-ink-soft">Continue lessons and quiz setup before publishing.</p>
                </label>
                <label className="rounded-control border border-line bg-canvas p-4">
                  <input className="mr-2 accent-brand-600" name="publish-state" type="radio" />
                  <span className="font-bold text-ink">Ready to publish</span>
                  <p className="mt-2 text-sm text-ink-soft">Use after lessons and quiz content are reviewed.</p>
                </label>
              </fieldset>
            </Card.Body>
            <Card.Footer>
              <Button leadingIcon={<Save className="size-4" />}>Save draft</Button>
              <Button variant="outline" leadingIcon={<Send className="size-4" />}>
                Publish mock
              </Button>
            </Card.Footer>
          </Card>
        </form>

        <aside className="space-y-5">
          <Card variant="dark">
            <h2 className="font-display text-heading-sm text-white">Authoring checklist</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              <li>Course title is clear and learner-facing.</li>
              <li>Description explains the outcome.</li>
              <li>Thumbnail is ready for catalog display.</li>
              <li>Lessons and quiz can be added after draft save.</li>
            </ul>
          </Card>
          <Card variant="surface">
            <h2 className="font-display text-heading-sm text-ink">MVP note</h2>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              This is a frontend mock. Backend persistence can connect later to the instructor-only course endpoint.
            </p>
          </Card>
        </aside>
      </div>
    </InstructorShell>
  );
}
