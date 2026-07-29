import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, FilePenLine, Users } from 'lucide-react';
import { InstructorShell } from '../../components/instructor/InstructorShell';
import { Badge, Button, Card, Table, type TableColumn } from '../../components/ui';
import {
  courseLearners,
  instructorCourses,
  instructorProfile,
  type InstructorCourse,
} from '../../data/instructorDashboard';

const publishedCourses = instructorCourses.filter((course) => course.status === 'published');
const draftCourses = instructorCourses.filter((course) => course.status === 'draft');
const totalLearners = instructorCourses.reduce((sum, course) => sum + course.enrolledCount, 0);
const completedLearners = courseLearners.filter((learner) => learner.status === 'completed').length;
const purchaseSeries = [
  { label: 'Jun 30', purchases: 0 },
  { label: 'Jul 01', purchases: 0 },
  { label: 'Jul 02', purchases: 0 },
  { label: 'Jul 03', purchases: 2 },
  { label: 'Jul 04', purchases: 1 },
  { label: 'Jul 05', purchases: 0 },
  { label: 'Jul 06', purchases: 0 },
  { label: 'Jul 07', purchases: 1 },
  { label: 'Jul 08', purchases: 3 },
  { label: 'Jul 09', purchases: 1 },
  { label: 'Jul 10', purchases: 2 },
  { label: 'Jul 11', purchases: 0 },
  { label: 'Jul 12', purchases: 0 },
  { label: 'Jul 13', purchases: 3 },
  { label: 'Jul 14', purchases: 1 },
  { label: 'Jul 15', purchases: 4 },
  { label: 'Jul 16', purchases: 2 },
  { label: 'Jul 17', purchases: 3 },
  { label: 'Jul 18', purchases: 1 },
  { label: 'Jul 19', purchases: 4 },
  { label: 'Jul 20', purchases: 2 },
  { label: 'Jul 21', purchases: 3 },
  { label: 'Jul 22', purchases: 2 },
  { label: 'Jul 23', purchases: 5 },
  { label: 'Jul 24', purchases: 3 },
  { label: 'Jul 25', purchases: 0 },
  { label: 'Jul 26', purchases: 0 },
  { label: 'Jul 27', purchases: 4 },
  { label: 'Jul 28', purchases: 3 },
  { label: 'Jul 29', purchases: 6 },
];

const courseColumns: TableColumn<InstructorCourse>[] = [
  {
    key: 'title',
    header: 'Course',
    accessor: (course) => (
      <div>
        <p className="font-bold text-ink">{course.title}</p>
        <p className="text-xs text-ink-muted">{course.category}</p>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (course) => (
      <Badge dot variant={course.status === 'published' ? 'success' : 'warning'}>
        {course.status === 'published' ? 'Published' : 'Draft'}
      </Badge>
    ),
  },
  { key: 'lessonCount', header: 'Lessons', accessor: 'lessonCount', align: 'right' },
  {
    key: 'completionRate',
    header: 'Completion',
    accessor: (course) => (
      <div className="flex min-w-36 items-center gap-3">
        <div className="h-2 flex-1 rounded-pill bg-canvas-warm">
          <div className="h-2 rounded-pill bg-brand-600" style={{ width: `${course.completionRate}%` }} />
        </div>
        <span className="w-9 text-right font-semibold text-ink">{course.completionRate}%</span>
      </div>
    ),
  },
];

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card variant="surface" className="min-h-36">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ink-muted">{label}</p>
          <p className="mt-3 font-display text-4xl font-black text-ink">{value}</p>
          <p className="mt-2 text-sm text-ink-soft">{detail}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-control bg-brand-50 text-brand-700">
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}

function CoursePurchasesChart() {
  const [activeIndex, setActiveIndex] = useState(purchaseSeries.length - 1);
  const [pointerGuideX, setPointerGuideX] = useState<number | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const chartWidth = 720;
  const chartHeight = 240;
  const chartPadding = 34;
  const maxPurchases = Math.max(32, ...purchaseSeries.map((point) => point.purchases));
  const activePoint = purchaseSeries[activeIndex];
  const totalPurchases = purchaseSeries.reduce((sum, point) => sum + point.purchases, 0);

  const chartPoints = useMemo(() => {
    return purchaseSeries.map((point, index) => {
      const x = chartPadding + (index / (purchaseSeries.length - 1)) * (chartWidth - chartPadding * 2);
      const y = chartHeight - chartPadding - (point.purchases / maxPurchases) * (chartHeight - chartPadding * 2);
      return { ...point, x, y };
    });
  }, [maxPurchases]);

  const linePath = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${chartPoints.at(-1)?.x ?? chartPadding} ${chartHeight - chartPadding} L ${chartPadding} ${chartHeight - chartPadding} Z`;
  const activeChartPoint = chartPoints[activeIndex];
  const guideX = pointerGuideX ?? activeChartPoint.x;

  function selectPoint(index: number) {
    setActiveIndex(index);
    setPointerGuideX(chartPoints[index]?.x ?? null);
    setIsInspecting(true);
  }

  function getChartClientX(pointX: number) {
    const bounds = chartWrapperRef.current?.getBoundingClientRect();
    if (!bounds) {
      return `${(pointX / chartWidth) * 100}%`;
    }

    const svgScale = bounds.width / chartWidth;
    return `${pointX * svgScale}px`;
  }

  function followPointer(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * chartWidth;
    const clampedX = Math.min(Math.max(x, chartPadding), chartWidth - chartPadding);
    const nearestIndex = chartPoints.reduce((nearest, point, index) => {
      return Math.abs(point.x - clampedX) < Math.abs(chartPoints[nearest].x - clampedX) ? index : nearest;
    }, 0);

    setPointerGuideX(clampedX);
    setActiveIndex(nearestIndex);
    setIsInspecting(true);
  }

  return (
    <Card variant="surface" className="mb-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Badge dot variant="brand">
            Interactive sample
          </Badge>
          <h2 className="mt-4 font-display text-heading-sm text-ink">Course purchases over time</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Students who bought instructor courses across the last 30 days. Move across the chart or choose a day to inspect the sample data.
          </p>
        </div>
        <div className="space-y-3 sm:min-w-72">
          <div className="rounded-control bg-canvas-warm p-4 text-right">
            <p className="text-xs font-bold uppercase text-ink-muted">30-day total</p>
            <p className="mt-1 font-display text-3xl font-black text-ink">{totalPurchases}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-visible">
        <div ref={chartWrapperRef} className="relative w-full min-w-[42rem] overflow-visible">
          {isInspecting ? (
            <div
              className="pointer-events-none absolute z-30 w-[8.75rem] -translate-x-1/2 rounded-control bg-ink px-4 py-3 text-center text-white shadow-lift"
              style={{
                left: getChartClientX(activeChartPoint.x),
                top: `${(activeChartPoint.y / chartHeight) * 100}%`,
                transform: 'translate(0, calc(-100% - 18px))',
              }}
            >
              <p className="text-xs font-extrabold leading-none">{activePoint.label}</p>
              <p className="mt-1.5 text-sm font-black leading-none">{activePoint.purchases} purchases</p>
            </div>
          ) : null}

        <svg
          className="w-full overflow-visible"
          role="img"
          aria-label="Line chart showing student course purchases over the last 30 days"
          onPointerMove={followPointer}
          onPointerLeave={() => {
            setPointerGuideX(null);
            setIsInspecting(false);
          }}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          <defs>
            <linearGradient id="purchase-chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#d7263d" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#d7263d" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((gridLine) => {
            const y = chartPadding + gridLine * ((chartHeight - chartPadding * 2) / 3);
            return <line key={gridLine} x1={chartPadding} x2={chartWidth - chartPadding} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="6 8" />;
          })}

          <path d={areaPath} fill="url(#purchase-chart-fill)" />
          <path d={linePath} fill="none" stroke="#d7263d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />

          {isInspecting ? (
            <line
              x1={guideX}
              x2={guideX}
              y1={chartPadding}
              y2={chartHeight - chartPadding}
              stroke="#d7263d"
              strokeDasharray="5 7"
              strokeOpacity="0.35"
            />
          ) : null}
          {chartPoints.map((point, index) => (
            <g
              className="cursor-pointer outline-none"
              key={point.label}
              onClick={() => selectPoint(index)}
              onBlur={() => setIsInspecting(false)}
              onFocus={() => {
                setActiveIndex(index);
                setPointerGuideX(point.x);
                setIsInspecting(true);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectPoint(index);
                }
              }}
              onMouseEnter={() => {
                setActiveIndex(index);
                setIsInspecting(true);
              }}
              role="button"
              tabIndex={0}
              aria-label={`Select ${point.label}, ${point.purchases} purchases`}
            >
              <title>{`${point.label}: ${point.purchases} purchases`}</title>
              <circle cx={point.x} cy={point.y} fill="transparent" r="10" />
              {index % 5 === 0 || index === chartPoints.length - 1 ? (
                <text fill="#697386" fontSize="11" fontWeight="700" textAnchor="middle" x={point.x} y={chartHeight - 8}>
                  {point.label.slice(4)}
                </text>
              ) : null}
            </g>
          ))}

          {isInspecting ? <circle cx={activeChartPoint.x} cy={activeChartPoint.y} fill="#d7263d" opacity="0.08" r="7" /> : null}
        </svg>
        </div>
      </div>
    </Card>
  );
}

export function InstructorOverviewPage() {
  return (
    <InstructorShell
      title={`Welcome back, ${instructorProfile.name.split(' ')[0]}.`}
      description="Manage your course drafts, published learning paths, lessons, quizzes, and course-scoped learner progress from one focused workspace."
      action={
        <Link to="/instructor/courses/new">
          <Button leadingIcon={<FilePenLine className="size-4" />}>Create course</Button>
        </Link>
      }
    >
      <CoursePurchasesChart />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BookOpen} label="My courses" value={String(instructorCourses.length)} detail="Owned by this instructor" />
        <MetricCard icon={CheckCircle2} label="Published" value={String(publishedCourses.length)} detail="Visible in catalog" />
        <MetricCard icon={FilePenLine} label="Draft courses" value={String(draftCourses.length)} detail="Need review before publish" />
        <MetricCard icon={Users} label="Learners" value={String(totalLearners)} detail={`${completedLearners} completed in mock records`} />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-heading-sm text-ink">Course health</h2>
            <p className="mt-1 text-sm text-ink-muted">MVP-safe summaries for courses you own.</p>
          </div>
          <Link to="/instructor/courses">
            <Button size="sm" variant="outline">
              View all
            </Button>
          </Link>
        </div>
        <Table caption="Instructor course health" columns={courseColumns} rows={instructorCourses} rowKey="id" hideCaption />
      </section>
    </InstructorShell>
  );
}
