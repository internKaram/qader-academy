import { useState, type ReactNode } from 'react';
import { Card, Badge, Button, Input, Modal, Spinner, Table, type TableColumn } from '../components/ui';
const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'create', 'free'] as const;
const buttonSizes = ['sm', 'md', 'lg'] as const;
const badgeVariants = ['neutral', 'brand', 'success', 'warning', 'danger', 'info', 'outline', 'create', 'free'] as const;
const cardVariants = ['surface', 'elevated', 'soft', 'dark', 'outline'] as const;

const colorTokens = [
  ['brand-600', 'bg-brand-600', '#d7263d'],
  ['ink', 'bg-ink', '#121826'],
  ['canvas', 'bg-canvas', '#ffffff'],
  ['canvas-soft', 'bg-canvas-soft', '#faf8f5'],
  ['success', 'bg-success', '#168a50'],
  ['warning', 'bg-warning', '#b7791f'],
  ['danger', 'bg-danger', '#c81e36'],
  ['info', 'bg-info', '#2563eb'],
] as const;

const spacingTokens = [
  ['4', '1rem'],
  ['6', '1.5rem'],
  ['8', '2rem'],
  ['12', '3rem'],
  ['16', '4rem'],
] as const;

const radiusTokens = [
  ['control', 'rounded-control'],
  ['card', 'rounded-card'],
  ['panel', 'rounded-panel'],
  ['pill', 'rounded-pill'],
] as const;

const shadowTokens = [
  ['card', 'shadow-card'],
  ['lift', 'shadow-lift'],
  ['button', 'shadow-button'],
] as const;

interface ProgressRow {
  id: string;
  learner: string;
  course: string;
  progress: number;
  status: ReactNode;
  lastAccessed: string;
}

const progressRows: ProgressRow[] = [
  {
    id: 'progress-001',
    learner: 'Sara M.',
    course: 'React Foundations',
    progress: 86,
    status: <Badge variant="success">Active</Badge>,
    lastAccessed: 'Today',
  },
  {
    id: 'progress-002',
    learner: 'Omar A.',
    course: 'Product Design Basics',
    progress: 42,
    status: <Badge variant="warning">In review</Badge>,
    lastAccessed: 'Yesterday',
  },
  {
    id: 'progress-003',
    learner: 'Noura K.',
    course: 'Data Literacy',
    progress: 100,
    status: <Badge variant="brand">Certificate earned</Badge>,
    lastAccessed: 'Jul 10',
  },
];

const progressColumns: TableColumn<ProgressRow>[] = [
  { key: 'learner', header: 'Learner', accessor: 'learner', sortable: true },
  { key: 'course', header: 'Course', accessor: 'course' },
  {
    key: 'progress',
    header: 'Progress',
    accessor: (row: ProgressRow) => (
      <div className="flex min-w-40 items-center gap-3">
        <div className="h-2 flex-1 rounded-pill bg-canvas-warm">
          <div className="h-2 rounded-pill bg-brand-600" style={{ width: `${row.progress}%` }} />
        </div>
        <span className="w-10 text-right font-semibold text-ink">{row.progress}%</span>
      </div>
    ),
  },
  { key: 'status', header: 'Status', accessor: 'status' },
  { key: 'lastAccessed', header: 'Last accessed', accessor: 'lastAccessed', align: 'right' },
];

function IconGlyph({ value }: { value: string }) {
  return <span className="inline-block text-sm font-black leading-none">{value}</span>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Style Guide</p>
          <h2 className="font-display text-heading-sm text-ink">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function TokenPanel({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="rounded-control border border-line bg-canvas p-4">
      <p className="mb-3 text-sm font-bold text-ink">{name}</p>
      {children}
    </div>
  );
}

export function StyleGuidePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-canvas-dark py-10 text-ink">
      <div className="page-container">
        <header className="rounded-panel bg-canvas-dark p-8 text-white shadow-lift sm:p-10">
          <Badge variant="brand">QaderAcademy</Badge>
          <h1 className="mt-5 font-display text-display-md">QaderAcademy Design System</h1>
          <p className="mt-4 max-w-reading text-lead text-white/70">
            Primitive UI components, foundation tokens, and interaction states for visual QA.
          </p>
        </header>

        <Section title="Color Tokens">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colorTokens.map(([name, className, value]) => (
              <TokenPanel key={name} name={name}>
                <div className={`${className} h-20 rounded-control border border-black/5`} />
                <p className="mt-3 font-mono text-xs text-ink-muted">{value}</p>
              </TokenPanel>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-control border border-line bg-canvas p-6">
              <p className="font-display text-display-md">Display</p>
              <p className="font-display text-heading-lg">Heading large</p>
              <p className="font-display text-heading-md">Heading medium</p>
              <p className="font-display text-heading-sm">Heading small</p>
            </div>
            <div className="space-y-4 rounded-control border border-line bg-canvas p-6">
              <p className="text-lead">Lead copy for public pages and section introductions.</p>
              <p className="body-copy">Body copy uses readable line length, strong contrast, and calm spacing for learning content.</p>
              <p className="eyebrow">Eyebrow label</p>
            </div>
          </div>
        </Section>

        <Section title="Spacing, Radius, Shadows">
          <div className="grid gap-4 lg:grid-cols-3">
            <TokenPanel name="Spacing">
              <div className="space-y-3">
                {spacingTokens.map(([name, width]) => (
                  <div className="flex items-center gap-3" key={name}>
                    <div className="h-4 rounded-pill bg-brand-600" style={{ width }} />
                    <span className="font-mono text-xs text-ink-muted">{name}</span>
                  </div>
                ))}
              </div>
            </TokenPanel>
            <TokenPanel name="Border radii">
              <div className="grid grid-cols-2 gap-3">
                {radiusTokens.map(([name, className]) => (
                  <div className={`${className} border border-line-strong bg-canvas-warm p-4 text-sm font-semibold`} key={name}>
                    {name}
                  </div>
                ))}
              </div>
            </TokenPanel>
            <TokenPanel name="Shadows">
              <div className="grid gap-3">
                {shadowTokens.map(([name, className]) => (
                  <div className={`${className} rounded-control bg-canvas p-4 text-sm font-semibold`} key={name}>
                    {name}
                  </div>
                ))}
              </div>
            </TokenPanel>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {buttonVariants.map((variant) => (
                <Button key={variant} variant={variant}>
                  {variant}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {buttonSizes.map((size) => (
                <Button key={size} size={size} variant="secondary">
                  {size}
                </Button>
              ))}
              <Button leadingIcon={<IconGlyph value="+" />}>Leading</Button>
              <Button trailingIcon={<IconGlyph value="->" />} variant="outline">
                Trailing
              </Button>
              <Button aria-label="Open search" iconOnly variant="ghost">
                <IconGlyph value="?" />
              </Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </div>
            <Button fullWidth variant="primary">
              Full width button
            </Button>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="grid gap-5 lg:grid-cols-3">
            <Input id="style-empty" label="Empty" placeholder="name@example.com" hint="Always-visible label." />
            <Input id="style-filled" label="Filled" defaultValue="learner@example.com" />
            <Input
              id="style-focused"
              label="Focused demo"
              defaultValue="Focused value"
              inputClassName="border-brand-600 ring-4 ring-brand-600/15"
            />
            <Input id="style-error" label="Error" defaultValue="bad-email" error="Enter a valid email address." />
            <Input id="style-disabled" label="Disabled" value="Disabled value" disabled readOnly />
            <Input id="style-readonly" label="Read-only" value="Read-only value" readOnly />
            <Input id="style-required" label="Required" placeholder="Required field" required />
            <Input id="style-optional" label="Optional" placeholder="Optional field" optional />
            <Input id="style-textarea" label="Textarea" defaultValue="Longer learner message." multiline />
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-5 lg:grid-cols-3">
            {cardVariants.map((variant) => (
              <Card key={variant} variant={variant} interactive={variant === 'elevated'} selected={variant === 'outline'}>
                <Card.Header>
                  <Badge variant={variant === 'dark' ? 'brand' : 'neutral'}>{variant}</Badge>
                  <h3 className="font-display text-heading-sm">Learning path</h3>
                </Card.Header>
                <Card.Body>
                  <p className={variant === 'dark' ? 'text-white/70' : 'text-ink-soft'}>
                    Reusable surface for grouped learning content, summaries, or actions.
                  </p>
                </Card.Body>
                <Card.Footer>
                  <Button size="sm" variant={variant === 'dark' ? 'outline' : 'ghost'}>
                    View
                  </Button>
                </Card.Footer>
              </Card>
            ))}
            <Card disabled>
              <Card.Header>
                <h3 className="font-display text-heading-sm">Disabled card</h3>
              </Card.Header>
              <Card.Body>
                <p className="text-ink-soft">De-emphasized surface for unavailable content.</p>
              </Card.Body>
            </Card>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-3">
            {badgeVariants.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
            <Badge dot variant="success">
              Published
            </Badge>
            <Badge leadingIcon={<IconGlyph value="+" />} variant="info">
              With icon
            </Badge>
            <Badge onRemove={() => undefined} removeLabel="Remove certificate badge" variant="brand">
              Certificate earned
            </Badge>
          </div>
        </Section>

        <Section title="Modal">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Course preview"
            description="Review the course summary before continuing."
            size="md"
          >
            <div className="space-y-5">
              <p className="body-copy">
                Modal content keeps focus inside the dialog, closes with Escape, and returns focus to the trigger.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setModalOpen(false)}>Continue</Button>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </Section>

        <Section title="Table">
          <div className="space-y-5">
            <Table caption="Sample progress records" columns={progressColumns} rows={progressRows} rowKey="id" />
            <Table
              caption="Compact progress records"
              columns={progressColumns}
              rows={progressRows.slice(0, 2)}
              rowKey="id"
              density="compact"
              hideCaption
            />
            <Table caption="Loading records" columns={progressColumns} rows={[]} rowKey="id" loading />
            <Table caption="Empty records" columns={progressColumns} rows={[]} rowKey="id" emptyMessage="No progress records found." />
            <Table caption="Error records" columns={progressColumns} rows={[]} rowKey="id" errorMessage="Progress data could not be loaded." />
          </div>
        </Section>

        <Section title="Spinner">
          <div className="flex flex-wrap items-center gap-8 rounded-control border border-line bg-canvas p-6">
            <Spinner size="sm" label="Loading small sample" />
            <Spinner size="md" label="Loading medium sample" />
            <Spinner size="lg" label="Loading large sample" />
            <span className="inline-flex items-center gap-3 text-sm font-semibold text-ink-soft">
              <Spinner decorative size="sm" /> Decorative with nearby status text
            </span>
          </div>
        </Section>

        <Section title="Focus And Containers">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-control border border-line bg-canvas p-6">
              <a className="inline-flex rounded-control px-3 py-2 font-bold text-brand-700 underline-offset-4 focus-visible:outline-brand-600/45" href="/style-guide">
                Focusable text link
              </a>
            </div>
            <div className="space-y-3 rounded-control border border-line bg-canvas p-6">
              <div className="page-container rounded-control border border-dashed border-line-strong bg-canvas-soft py-4 text-center text-sm font-semibold text-ink-muted">
                page-container
              </div>
              <div className="max-w-reading rounded-control border border-dashed border-line-strong bg-canvas-soft p-4 text-sm font-semibold text-ink-muted">
                reading width
              </div>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
