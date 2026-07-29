# QaderAcademy Frontend Implementation Specification

## 1. Objective

Build the first public-facing frontend release of **QaderAcademy**, an education platform inspired by:

- **QaderTech** for the core visual identity, brand tone, colors, typography character, and polished Saudi digital-business feel.
- **Enonix** for the page composition, editorial spacing, hero treatment, course presentation, visual rhythm, and education-focused landing-page structure.

This release is **frontend-only**. Do not build a production backend, database, authentication service, instructor portal, student dashboard, payment flow, or course player.

The implementation must include:

1. A reusable design system expressed through TailwindCSS configuration and CSS variables.
2. A small React component library inside the monorepo.
3. A public landing page.
4. An About page.
5. A Contact page with a mocked `POST /api/contact` endpoint.
6. A Style Guide page displaying every component in every required state.
7. Mock domain data shaped around the supplied class diagram and ERD.
8. Responsive, accessible, client-side-rendered React pages.

---

## 2. Technical Constraints

### Required stack

- React using **JavaScript**, not TypeScript.
- Vite.
- React Router.
- TailwindCSS.
- Client-side rendering only.
- CSS-only animations and transitions.
- No Framer Motion, GSAP, Web Animations API, or JavaScript-driven layout animation.
- npm workspaces for the monorepo.
- MSW or an equivalent browser-side mock layer for `POST /api/contact`.
- ESLint and Prettier.
- Vitest and React Testing Library for focused component/page tests.

### General implementation rules

- Use semantic HTML before adding ARIA.
- Do not expose database-oriented properties such as `passwordHash` in UI models.
- Keep page-specific code in the app package and reusable primitives in the UI package.
- Do not copy proprietary text, images, or logos from reference websites.
- Create original placeholder content and use replaceable local assets.
- Keep all sample data in dedicated mock-data files.
- Avoid hidden global dependencies between the app and the UI package.

---

## 3. Monorepo Structure

Use this structure unless a minor adjustment is required for tooling:

```text
qader-academy/
├─ package.json
├─ .gitignore
├─ .editorconfig
├─ eslint.config.js
├─ prettier.config.js
├─ README.md
├─ docs/
│  ├─ class-diagram.png
│  ├─ erd-diagram.png
│  └─ frontend-domain-mapping.md
├─ apps/
│  └─ web/
│     ├─ index.html
│     ├─ package.json
│     ├─ vite.config.js
│     ├─ tailwind.config.js
│     ├─ postcss.config.js
│     ├─ public/
│     │  ├─ images/
│     │  └─ icons/
│     └─ src/
│        ├─ app/
│        │  ├─ App.jsx
│        │  ├─ router.jsx
│        │  └─ providers.jsx
│        ├─ assets/
│        ├─ components/
│        │  ├─ layout/
│        │  ├─ marketing/
│        │  └─ courses/
│        ├─ data/
│        │  ├─ courses.js
│        │  ├─ testimonials.js
│        │  └─ siteContent.js
│        ├─ hooks/
│        ├─ layouts/
│        │  └─ PublicLayout.jsx
│        ├─ mocks/
│        │  ├─ browser.js
│        │  └─ handlers.js
│        ├─ pages/
│        │  ├─ HomePage.jsx
│        │  ├─ AboutPage.jsx
│        │  ├─ ContactPage.jsx
│        │  ├─ StyleGuidePage.jsx
│        │  └─ NotFoundPage.jsx
│        ├─ services/
│        │  └─ contactService.js
│        ├─ styles/
│        │  └─ globals.css
│        └─ main.jsx
└─ packages/
   └─ ui/
      ├─ package.json
      └─ src/
         ├─ components/
         │  ├─ Badge/
         │  │  ├─ Badge.jsx
         │  │  └─ index.js
         │  ├─ Button/
         │  ├─ Card/
         │  ├─ Input/
         │  ├─ Modal/
         │  ├─ Spinner/
         │  └─ Table/
         ├─ utilities/
         │  ├─ cn.js
         │  └─ focusStyles.js
         └─ index.js
```

The web app must import the component library through a workspace-relative package alias, for example:

```js
import { Button, Card, Input } from '@qader-academy/ui';
```

The package must resolve locally through npm workspaces. It is not published to a public package registry in this release.

---

## 4. Visual Direction

### QaderTech influence

The site should feel:

- Confident and contemporary.
- Saudi and regionally appropriate without relying on decorative clichés.
- Technology-led but approachable.
- Clean, high-contrast, and practical.
- Strongly branded through a red primary color, dark ink typography, warm neutral backgrounds, and precise spacing.

### Enonix influence

Use these composition principles:

- Large editorial hero headline.
- Clear primary and secondary calls to action.
- Strong course-card grid.
- Rounded image containers and layered information blocks.
- Alternating light and dark sections.
- Large numerical/statistical callouts.
- Generous section spacing.
- Small eyebrow labels above section headings.
- Controlled asymmetry on desktop, simplified stacking on mobile.

### Originality rule

Use the reference sites for design direction only. Do not reproduce their exact layout, copy, illustrations, or asset composition.

---

## 5. Design Tokens

Define tokens in both CSS custom properties and Tailwind configuration. Components should consume semantic tokens rather than arbitrary hex values.

### 5.1 Color tokens

```js
// apps/web/tailwind.config.js
import sharedTheme from '../../packages/ui/tailwind-theme.js';

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    '../../packages/ui/src/**/*.{js,jsx}',
  ],
  theme: {
    extend: sharedTheme,
  },
  plugins: [],
};
```

```js
// packages/ui/tailwind-theme.js
export default {
  colors: {
    brand: {
      50: '#FFF1F2',
      100: '#FFE0E3',
      200: '#FFC7CC',
      300: '#FF9CA6',
      400: '#F96878',
      500: '#E83B50',
      600: '#D7263D',
      700: '#B7192E',
      800: '#98192B',
      900: '#801A29',
      950: '#470A12',
    },
    ink: {
      DEFAULT: '#121826',
      soft: '#364152',
      muted: '#697386',
      inverse: '#FFFFFF',
    },
    canvas: {
      DEFAULT: '#FFFFFF',
      soft: '#FAF8F5',
      warm: '#F3EEE8',
      dark: '#121826',
    },
    line: {
      DEFAULT: '#E5E7EB',
      strong: '#CBD2DA',
      dark: '#2B3443',
    },
    success: {
      light: '#ECFDF3',
      DEFAULT: '#168A50',
      dark: '#11683E',
    },
    warning: {
      light: '#FFF8E6',
      DEFAULT: '#B7791F',
      dark: '#7A4D0D',
    },
    danger: {
      light: '#FFF1F2',
      DEFAULT: '#C81E36',
      dark: '#96152A',
    },
    info: {
      light: '#EFF6FF',
      DEFAULT: '#2563EB',
      dark: '#1D4ED8',
    },
  },
  fontFamily: {
    sans: ['Inter', 'Tajawal', 'system-ui', 'sans-serif'],
    display: ['Tajawal', 'Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.625rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.875rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.6rem' }],
    '5xl': ['3rem', { lineHeight: '1.08' }],
    '6xl': ['3.75rem', { lineHeight: '1.02' }],
    '7xl': ['4.5rem', { lineHeight: '0.98' }],
  },
  spacing: {
    18: '4.5rem',
    22: '5.5rem',
    26: '6.5rem',
    30: '7.5rem',
  },
  borderRadius: {
    xs: '0.375rem',
    sm: '0.625rem',
    md: '0.875rem',
    lg: '1.125rem',
    xl: '1.5rem',
    '2xl': '2rem',
    pill: '9999px',
  },
  boxShadow: {
    card: '0 16px 40px rgba(18, 24, 38, 0.08)',
    lift: '0 24px 64px rgba(18, 24, 38, 0.14)',
    focus: '0 0 0 4px rgba(215, 38, 61, 0.18)',
  },
  maxWidth: {
    content: '76rem',
    reading: '46rem',
  },
  transitionDuration: {
    250: '250ms',
  },
};
```

### 5.2 CSS variables

```css
/* apps/web/src/styles/globals.css */
:root {
  --color-brand: 215 38 61;
  --color-brand-hover: 183 25 46;
  --color-ink: 18 24 38;
  --color-ink-soft: 54 65 82;
  --color-ink-muted: 105 115 134;
  --color-canvas: 255 255 255;
  --color-canvas-soft: 250 248 245;
  --color-line: 229 231 235;
  --radius-control: 0.875rem;
  --radius-card: 1.5rem;
  --shadow-card: 0 16px 40px rgba(18, 24, 38, 0.08);
  --content-width: 76rem;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: rgb(var(--color-canvas));
  color: rgb(var(--color-ink));
  font-family: Inter, Tajawal, system-ui, sans-serif;
  text-rendering: optimizeLegibility;
}

::selection {
  background: rgba(215, 38, 61, 0.18);
}

:focus-visible {
  outline: 3px solid rgba(215, 38, 61, 0.45);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5.3 Typography scale usage

| Role | Tailwind classes | Usage |
|---|---|---|
| Display XL | `text-5xl md:text-6xl xl:text-7xl font-black tracking-[-0.04em]` | Home hero only |
| Display | `text-4xl md:text-5xl font-black tracking-[-0.035em]` | Page hero headings |
| H2 | `text-3xl md:text-4xl font-extrabold tracking-[-0.025em]` | Main sections |
| H3 | `text-xl md:text-2xl font-bold` | Cards and subsections |
| Lead | `text-lg md:text-xl text-ink-soft` | Introductory paragraph |
| Body | `text-base text-ink-soft` | Standard content |
| Small | `text-sm text-ink-muted` | Metadata |
| Eyebrow | `text-xs font-extrabold uppercase tracking-[0.16em] text-brand-600` | Section labels |

Rules:

- Limit paragraph width to approximately `65ch`.
- Do not use more than three font weights in one section.
- Hero text may use `font-black`; body text should normally use `font-normal` or `font-medium`.
- Support both left-to-right and right-to-left layout at the component level.

### 5.4 Spacing scale

Use Tailwind's base 4px scale. Preferred semantic spacing:

| Purpose | Value |
|---|---:|
| Inline icon gap | 8px |
| Compact control gap | 12px |
| Standard component gap | 16px |
| Card padding, mobile | 20px |
| Card padding, desktop | 24–32px |
| Grid gap | 24px |
| Section padding, mobile | 64px |
| Section padding, tablet | 88px |
| Section padding, desktop | 104–120px |
| Max page gutter | 24px mobile, 40px tablet, 48px desktop |

Use a shared container utility:

```jsx
<div className="mx-auto w-full max-w-content px-5 sm:px-6 lg:px-10">
  {children}
</div>
```

---

## 6. Component Library

All components must:

- Be written in JavaScript and JSX.
- Forward refs where relevant.
- Accept `className` without discarding internal styles.
- Use a shared `cn()` utility.
- Expose accessible labels and state attributes.
- Remain presentation-focused; no page-specific API calls.
- Include focused tests.

### 6.1 `Button`

#### API

```jsx
<Button
  variant="primary"
  size="md"
  type="button"
  loading={false}
  disabled={false}
  leadingIcon={IconComponent}
  trailingIcon={IconComponent}
  fullWidth={false}
  onClick={handler}
>
  Start learning
</Button>
```

#### Variants

- `primary`: brand background, white text.
- `secondary`: dark ink background, white text.
- `outline`: transparent background, strong border, ink text.
- `ghost`: transparent, subtle hover fill.
- `danger`: danger background, white text.

#### Sizes

- `sm`: 36px minimum height.
- `md`: 44px minimum height.
- `lg`: 52px minimum height.

#### States

- Default.
- Hover.
- Active.
- Focus-visible.
- Disabled.
- Loading with Spinner and stable button width.
- Icon-only with required `aria-label`.

#### Styling expectations

- Rounded `rounded-md` for normal buttons.
- Use `rounded-pill` only for compact tags or special hero CTA treatment.
- Transition color, transform, and shadow in 200–250ms.
- Hover may translate upward by 1px using CSS.
- Active returns to the baseline.

### 6.2 `Input`

Use a compound field wrapper rather than an unlabelled input.

```jsx
<Input
  id="email"
  name="email"
  type="email"
  label="Email address"
  placeholder="name@example.com"
  hint="We will only use this to reply."
  error="Enter a valid email address."
  required
  disabled={false}
/>
```

Supported input types:

- `text`
- `email`
- `tel`
- `url`
- `password`
- `number`
- `textarea` through a `multiline` prop

States:

- Empty.
- Filled.
- Focused.
- Invalid.
- Disabled.
- Read-only.
- Required.
- Optional.

Requirements:

- Label is always visible.
- Placeholder must not replace the label.
- Error text uses `role="alert"` only when validation changes dynamically.
- Apply `aria-invalid` and `aria-describedby` correctly.
- Textarea has a sensible minimum height and may resize vertically.

### 6.3 `Card`

```jsx
<Card variant="elevated" padding="lg" interactive={false}>
  <Card.Header>...</Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

Variants:

- `surface`: white with subtle border.
- `elevated`: white with card shadow.
- `soft`: warm neutral background.
- `dark`: dark canvas with inverse text.
- `outline`: transparent with strong border.

States:

- Static.
- Interactive hover.
- Focused link-card.
- Selected.
- Disabled/de-emphasized.

Do not make the entire card clickable when it contains multiple interactive controls. For course cards, use a stretched title link or one clear card-level link.

### 6.4 `Modal`

```jsx
<Modal
  open={isOpen}
  onClose={closeModal}
  title="Course preview"
  description="Review the course summary before continuing."
  size="md"
>
  ...
</Modal>
```

Requirements:

- Render through a portal.
- `role="dialog"` and `aria-modal="true"`.
- Restore focus to the invoking element after close.
- Trap keyboard focus while open.
- Close on Escape.
- Optional close on backdrop click, default `true`.
- Prevent background scrolling while open.
- Use CSS opacity and transform transitions.
- Respect reduced-motion preference.

Sizes: `sm`, `md`, `lg`.

### 6.5 `Badge`

```jsx
<Badge variant="brand" size="sm" dot={false}>Popular</Badge>
```

Variants:

- `neutral`
- `brand`
- `success`
- `warning`
- `danger`
- `info`
- `outline`

States:

- Text-only.
- With dot.
- With leading icon.
- Removable only when an explicit accessible remove button is supplied.

### 6.6 `Table`

```jsx
<Table
  caption="Sample course records"
  columns={columns}
  rows={rows}
  rowKey="id"
  emptyMessage="No records found."
/>
```

Requirements:

- Semantic `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`.
- Visible caption or visually hidden caption.
- Responsive horizontal scrolling inside a labelled region.
- Optional compact and comfortable density.
- Optional sortable header appearance, but no production sorting logic is required unless used on the style guide.
- Loading, empty, populated, and error presentations.
- Never convert core tabular data into visually unrelated cards without a clear mobile strategy.

### 6.7 `Spinner`

```jsx
<Spinner size="md" label="Loading courses" />
```

Sizes: `sm`, `md`, `lg`.

Requirements:

- CSS animation only.
- Use `role="status"`.
- Include visually hidden text.
- Decorative spinner usage can use `aria-hidden="true"` when another status label exists.

---

## 7. Composite App Components

These belong in `apps/web`, not the primitive UI package.

### Layout components

- `SiteHeader`
- `MobileNavigation`
- `SiteFooter`
- `PageContainer`
- `SectionHeading`
- `PageHero`

### Marketing components

- `HeroSection`
- `FeatureCard`
- `StatsStrip`
- `TestimonialCard`
- `CallToActionSection`

### Course components

- `CourseCard`
- `CourseMeta`
- `InstructorSummary`
- `CourseGrid`
- `CourseCardSkeleton`

---

## 8. Domain-to-Frontend Mapping

The supplied diagrams contain these domain entities:

- User
- Course
- Lesson
- Quiz
- Question
- Enrollment
- Progress
- Certificate

The frontend must not reproduce backend classes directly. Create safe, UI-focused view models derived from them.

### 8.1 User

Backend/domain fields shown in the diagrams include:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `avatar`
- `createdAt`

Public frontend usage:

```js
export const publicInstructor = {
  id: 'usr_inst_001',
  name: 'Sara Alharbi',
  role: 'instructor',
  avatarUrl: '/images/instructors/sara-alharbi.webp',
  title: 'Senior Product Designer',
};
```

Rules:

- Never include or mock `passwordHash` in public frontend data.
- Do not expose instructor email by default.
- Only `role === 'instructor'` users may appear as course instructors in public mock data.

### 8.2 Course

Diagram fields:

- `id`
- `title`
- `description`
- `thumbnail`
- `category`
- `instructorId`
- `price`
- `createdAt`
- publishing/archive behavior

Public view model:

```js
export const course = {
  id: 'course_react_001',
  slug: 'modern-react-foundations',
  title: 'Modern React Foundations',
  shortDescription: 'Build responsive interfaces using reusable React patterns.',
  thumbnailUrl: '/images/courses/react-foundations.webp',
  category: 'Web Development',
  instructor: publicInstructor,
  price: 249,
  currency: 'SAR',
  isPublished: true,
  isFeatured: true,
  lessonCount: 18,
  quizCount: 4,
  durationMinutes: 420,
  enrolledCount: 1260,
  rating: 4.8,
  reviewCount: 186,
};
```

Public lists must include only `isPublished: true` courses.

### 8.3 Lesson

Diagram fields:

- `id`
- `courseId`
- `title`
- `contentUrl`
- `duration`
- `order` or `orderIndex`

For this release, Lesson data is not rendered as a full player. It may only provide aggregate course-card information:

- lesson count
- total duration
- optional preview lesson title

Do not create lesson completion controls on public pages.

### 8.4 Quiz and Question

Quiz and Question belong to the learning experience and are not implemented in this public release.

They influence frontend wording and metrics only:

- Course cards may display quiz count.
- Feature content may mention assessments.
- Future components should anticipate `passingScore`, `points`, and multiple options.

Do not expose correct answers or `correctIndex` in public mock data.

### 8.5 Enrollment

Enrollment links a student User to a Course.

For the public site:

- Use aggregate `enrolledCount` only.
- Do not implement enrolment mutation.
- CTA buttons may navigate to Contact or show a "Coming soon" Modal.
- Do not create fake persisted enrollment records.

### 8.6 Progress

Progress links an Enrollment to a Lesson and stores percentage and last-accessed information.

For this release:

- Use progress only in the Style Guide's Table sample to demonstrate future-ready table data.
- Do not show a student dashboard.
- Do not persist progress.

### 8.7 Certificate

Certificate links a student and course and includes a certificate number and issued date.

For this release:

- Mention certificates in marketing features.
- A Badge may demonstrate `Certificate earned` in the Style Guide.
- Do not implement generation or verification routes.

### 8.8 Relationship implications for UI

| Relationship | Frontend implication |
|---|---|
| User instructs many Courses | Course card embeds a safe instructor summary. |
| Course contains many Lessons | Course cards show lesson count and duration. |
| Course has many Quizzes | Course cards may show assessment count. |
| Quiz contains many Questions | Reserved for a future learner app. |
| User enrolls in many Courses | Reserved for a future authenticated dashboard. |
| Enrollment tracks many Progress records | Style Guide may show sample progress rows. |
| Course/User can produce Certificates | Marketing section may promote certification. |

---

## 9. Mock Data Requirements

Create at least six course records across categories such as:

- Web Development
- UX/UI Design
- Data and AI
- Digital Marketing
- Cybersecurity
- Business Skills

At least four must have `isFeatured: true` and appear in the Top Courses section.

Create at least three instructor records.

Create three testimonial placeholders with clearly fictional names or generic placeholder labels. Do not imply they are real customer endorsements.

Example:

```js
export const testimonials = [
  {
    id: 'testimonial-placeholder-01',
    quote: 'Placeholder testimonial copy for layout review. Replace before launch.',
    name: 'Learner Name',
    role: 'Course participant',
    avatarUrl: '/images/placeholders/avatar-01.webp',
    isPlaceholder: true,
  },
];
```

Render a small visible `Placeholder` Badge in testimonial cards until real approved content is supplied.

---

## 10. Routing

Required routes:

```text
/              Home
/about         About
/contact       Contact
/style-guide   Style Guide
/*             Not Found
```

Use React Router with lazy-loaded page modules where practical.

The Style Guide route may remain publicly accessible during development. Add a clear comment describing how to restrict or remove it before production.

---

## 11. Public Layout

### Header

Desktop:

- Brand mark or text logo on the left.
- Navigation: Home, About, Courses anchor, Contact.
- Primary CTA: `Explore courses`.
- Sticky after scrolling is acceptable, but implement only with CSS positioning.
- Use a subtle translucent or solid background, never a heavy blur that reduces readability.

Mobile:

- Brand mark.
- Menu button with accessible label and expanded state.
- Collapsible menu.
- Manage menu state in React; the transition itself must be CSS-only.
- Locking page scroll while the menu is open is permitted.

### Footer

Include:

- Brand summary.
- Navigation links.
- Course-category links as placeholders.
- Contact details placeholders.
- Social-link placeholders.
- Copyright using the current year at runtime.
- Links for Privacy and Terms as disabled or placeholder links with clear labels until pages exist.

---

## 12. Home Page

### 12.1 Hero section

Composition:

- Two-column desktop layout, stacked mobile layout.
- Left: eyebrow, large headline, supporting paragraph, two CTAs.
- Right: original education-oriented visual made from local placeholder imagery and UI cards.
- Use a warm-neutral background with restrained red accents.
- Add a small stats cluster such as courses, instructors, and learners. Values must be explicitly marked as sample metrics in data or copy until verified.

Suggested content direction:

- Eyebrow: `Practical learning for real progress`
- Headline: `Build skills that move your future forward.`
- Primary CTA: `Explore top courses`
- Secondary CTA: `Learn about QaderAcademy`

Behavior:

- Primary CTA scrolls to `#top-courses`.
- Secondary CTA navigates to `/about`.
- Entry animation uses CSS classes and keyframes only.
- Avoid autoplay video.

### 12.2 Features section

Create three or four feature cards:

1. Expert-led courses.
2. Structured lessons.
3. Assessments and progress tracking.
4. Shareable certificates.

Each card includes:

- Icon.
- Short title.
- Two-sentence description.
- Optional numeric label such as `01`.

Feature content should reflect the domain model without claiming unfinished functionality is currently available. Use wording such as `Designed to support...` where necessary.

### 12.3 Top Courses section

Requirements:

- `id="top-courses"`.
- Section heading and short copy.
- Responsive grid: one column mobile, two columns tablet, three or four columns wide desktop depending on available width.
- Render from `courses.js`, never hard-code individual cards in JSX.
- Only render published and featured courses.
- Include a graceful empty state.

Each `CourseCard` displays:

- Thumbnail.
- Category Badge.
- Title.
- Short description, line-clamped.
- Instructor name and avatar.
- Rating and review count.
- Lesson count.
- Duration.
- Enrolled count.
- Price in SAR.
- CTA or title link.

Click behavior for this release:

- Open a Modal containing a concise course preview.
- Modal CTA navigates to `/contact?course=<slug>` or displays a clearly marked `Enrollment coming soon` message.
- Do not add non-functional Add to Cart buttons.

### 12.4 Testimonials placeholder

Requirements:

- Three placeholder testimonial cards.
- Each includes a visible `Placeholder` Badge.
- Add a source-code comment that these must be replaced with approved testimonials before production.
- Do not use made-up performance percentages or unverifiable claims.

### 12.5 Closing CTA

Use a dark section with inverse text and a brand-red CTA.

Suggested message:

- Heading: `Ready to choose your next skill?`
- Primary CTA: `Talk to our team`
- Secondary text link: `See how the platform works`

The primary CTA navigates to `/contact`.

---

## 13. About Page

Sections:

1. Page hero.
2. Mission statement.
3. What makes QaderAcademy different.
4. Learning journey timeline.
5. Domain-informed platform model.
6. Closing CTA.

### Mission statement

Focus on practical, accessible, career-relevant learning.

### Differentiators

Use three cards:

- Clear learning paths.
- Applied assessment.
- Measurable progress.

### Learning journey

Display a four-step responsive timeline:

1. Select a course.
2. Complete ordered lessons.
3. Pass quizzes and track progress.
4. Earn a certificate.

This sequence reflects the supplied class relationships but must be described as the platform direction where functionality is not included in the current release.

### Platform model section

Use a simple visual explanation, not the raw ERD itself:

- Courses contain lessons and quizzes.
- Learners enroll in courses.
- Progress records lesson completion.
- Completed learning paths can issue certificates.

Add a small link or expandable details block referencing the diagrams stored in `/docs` for developers. Do not display database key notation to general users.

---

## 14. Contact Page

### Layout

Desktop two-column layout:

- Left: heading, supporting copy, response-time placeholder, contact details placeholders.
- Right: form in an elevated Card.

Mobile stacks content vertically.

### Fields

- Full name: required, 2–80 characters.
- Email: required, valid email format.
- Phone: optional.
- Topic: required select with options:
  - Course information
  - Corporate training
  - Instructor partnership
  - Technical support
  - General enquiry
- Course interest: optional; prefilled from the `course` query string when present.
- Message: required, 20–1000 characters.
- Consent checkbox: required.

### Submission contract

The form must call:

```http
POST /api/contact
Content-Type: application/json
```

Request body:

```json
{
  "name": "Abdulrahman Example",
  "email": "name@example.com",
  "phone": "+966500000000",
  "topic": "course-information",
  "courseInterest": "modern-react-foundations",
  "message": "I would like more information about the next course intake.",
  "consent": true
}
```

Success response:

```json
{
  "ok": true,
  "message": "Thanks. Your message has been received.",
  "reference": "QA-DEMO-1042"
}
```

Validation error response:

```json
{
  "ok": false,
  "message": "Please correct the highlighted fields.",
  "fieldErrors": {
    "email": "Enter a valid email address."
  }
}
```

Mock server behavior:

- Add 700–1200ms artificial latency.
- Return success for valid data.
- Return a validation error when email contains `invalid`.
- Return a generic server error when email contains `error`.
- Do not send any data to a real server.

### Submission states

- Idle.
- Client validation error.
- Submitting.
- Success with reference number.
- Server validation error.
- Generic failure with retry option.

Requirements:

- Disable duplicate submission while pending.
- Preserve entered values on server failure.
- Focus the success heading after successful submission.
- Focus the error summary when validation fails.
- Include an error summary above the form with anchor links to invalid fields.

---

## 15. Style Guide Page

Route: `/style-guide`

Purpose: provide a complete visual QA surface for the design system.

### Required sections

1. Color tokens.
2. Typography scale.
3. Spacing scale.
4. Border radii.
5. Shadows.
6. Buttons.
7. Inputs.
8. Cards.
9. Badges.
10. Modal.
11. Table.
12. Spinner.
13. Course card.
14. Focus states.
15. Responsive container examples.

### Required component states

#### Button

- Every variant.
- Every size.
- With leading icon.
- With trailing icon.
- Icon only.
- Disabled.
- Loading.
- Full width.

#### Input

- Empty.
- Filled.
- Focused demonstration.
- Error.
- Disabled.
- Read-only.
- Textarea.
- Required.
- Optional.

#### Card

- Every variant.
- Interactive.
- Selected.
- Dark.
- Course-card composition.

#### Badge

- Every variant.
- Every size.
- With dot.
- With icon.

#### Modal

- Include buttons to open small, medium, and large examples.

#### Table

- Populated course data.
- Progress data derived from the diagram entities.
- Empty state.
- Loading state.
- Error state.
- Compact and comfortable density.

#### Spinner

- Every size.
- On light and dark backgrounds.
- Inside a loading button.

### Token display

Each token sample must show:

- Semantic name.
- Tailwind class or key.
- Hex value when relevant.
- Intended usage.

---

## 16. Responsive Behavior

Target widths:

- Mobile: 320–639px.
- Small tablet: 640–767px.
- Tablet: 768–1023px.
- Desktop: 1024–1279px.
- Wide desktop: 1280px and above.

Rules:

- No horizontal page scrolling at 320px.
- Header becomes mobile navigation below the desktop breakpoint.
- Hero changes from two columns to one column.
- Course grid becomes one, two, then three columns.
- Large display text scales down fluidly.
- Tables scroll within their own region on narrow screens.
- Modal uses nearly full viewport width on mobile with safe margins.
- Touch targets must be at least 44×44 CSS pixels where practical.

---

## 17. Accessibility

Meet WCAG 2.2 AA as the implementation target.

Required checks:

- Logical heading order.
- Keyboard-accessible navigation and controls.
- Visible focus indicators.
- Sufficient color contrast.
- Form labels and accessible error association.
- Modal focus management.
- Reduced-motion support.
- Alt text for meaningful imagery.
- Empty alt text for decorative images.
- No meaning communicated by color alone.
- Navigation uses `aria-current="page"`.
- Mobile menu button uses `aria-expanded` and `aria-controls`.
- Course-card metadata uses readable text rather than icon-only meaning.

---

## 18. CSS-Only Motion

Allowed:

- Hover lift.
- Fade and translate entrance classes.
- Button press feedback.
- Modal fade/scale.
- Mobile-menu reveal.
- Skeleton shimmer.
- Spinner rotation.
- Underline or background transitions.

Not allowed:

- JavaScript animation libraries.
- Scroll-position calculations for animation.
- Cursor-following effects.
- Continuous decorative motion that distracts from content.

Suggested utilities:

```css
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.card-lift {
  transition:
    transform 250ms ease,
    box-shadow 250ms ease,
    border-color 250ms ease;
}

.card-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 64px rgba(18, 24, 38, 0.14);
}
```

Do not hide essential content before animation. Content must remain visible when CSS fails or reduced motion is enabled.

---

## 19. Images and Assets

- Store the supplied diagrams in `/docs` and preserve their original aspect ratios.
- Use local placeholder course thumbnails in `apps/web/public/images/courses`.
- Prefer WebP or AVIF for photographic images, with reasonable fallback where needed.
- Provide explicit width and height attributes to reduce layout shift.
- Lazy-load below-the-fold images.
- Do not hotlink images from QaderTech or Enonix.
- Use a consistent image ratio for course thumbnails, preferably 16:10.

---

## 20. Error, Empty, and Loading States

Every data-driven section must have an explicit state:

### Top Courses

- Loading: skeleton cards.
- Loaded: course grid.
- Empty: clear message and Contact CTA.
- Error: concise message with Retry button.

Although data is local in this release, preserve these states in the component design so the real API can replace mock data later.

### Contact form

Follow the submission states defined in the Contact Page section.

### Table

Support populated, empty, loading, and error states in the UI package or a thin app wrapper.

---

## 21. Testing Requirements

### Component tests

Test at minimum:

- Button renders variants, disabled state, and loading label.
- Input associates label, hint, and error text correctly.
- Modal opens, closes with Escape, and restores focus.
- Badge renders semantic variant classes.
- Table renders caption, headers, rows, empty state, and loading state.
- Spinner exposes an accessible status label.

### Page tests

- Home renders only published featured courses.
- Course-card interaction opens the preview Modal.
- Contact validates required fields.
- Contact success state renders mocked reference number.
- Contact server-error scenario preserves form values.
- Navigation indicates the active route.

### Manual QA

Verify:

- 320px mobile width.
- 768px tablet width.
- 1440px desktop width.
- Keyboard-only navigation.
- Reduced-motion mode.
- High zoom at 200%.
- RTL smoke test by setting the document direction to `rtl`.

---

## 22. Performance Requirements

- Keep initial JavaScript modest; lazy-load non-home pages.
- Avoid importing entire icon libraries when tree-shakable individual icons are available.
- Optimize local images.
- Prevent cumulative layout shift by defining media dimensions.
- Avoid large background videos.
- Avoid unnecessary React context providers.
- Memoization should be used only when profiling or clear render behavior justifies it.

Target Lighthouse goals on a production build with local mock data:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

Treat these as engineering targets rather than guaranteed scores across every device.

---

## 23. SEO and Metadata

Each page must define:

- Unique document title.
- Meta description.
- Canonical placeholder strategy documented in README.
- Open Graph title and description.

Suggested titles:

- Home: `QaderAcademy | Practical Skills for Real Progress`
- About: `About QaderAcademy`
- Contact: `Contact QaderAcademy`
- Style Guide: `QaderAcademy Design System`

Add structured data only when content is real and approved. Do not invent Course schema ratings or review counts for production metadata.

---

## 24. Implementation Sequence

Codex should implement in this order:

1. Initialize npm workspace and Vite web app.
2. Add TailwindCSS and global token configuration.
3. Create the UI package and shared `cn()` utility.
4. Implement Button, Spinner, Badge, Input, Card, Modal, and Table.
5. Add component tests.
6. Build the Style Guide page first and visually verify all states.
7. Create mock domain data based on the diagrams.
8. Implement `PublicLayout`, header, mobile navigation, and footer.
9. Build Home page sections.
10. Build About page.
11. Configure MSW and contact service.
12. Build Contact page and form states.
13. Add routing, Not Found page, metadata, and lazy loading.
14. Complete responsive, accessibility, and reduced-motion QA.
15. Write README setup and architecture notes.

---

## 25. Acceptance Criteria

The task is complete only when all conditions below are satisfied.

### Architecture

- [ ] React uses JavaScript, not TypeScript.
- [ ] The repository uses npm workspaces.
- [ ] The reusable UI library is inside `packages/ui`.
- [ ] The app imports UI components using the local workspace package.
- [ ] Page-specific components are not placed in the primitive library.

### Design system

- [ ] Color, typography, spacing, radius, and shadow tokens are defined.
- [ ] Tailwind scans both the app and UI package.
- [ ] Components avoid arbitrary colors when a semantic token exists.
- [ ] The visual result is QaderTech-inspired and Enonix-influenced without copying assets.

### Components

- [ ] Button supports all specified variants, sizes, disabled, loading, and icon states.
- [ ] Input supports labels, hints, errors, disabled, read-only, and multiline states.
- [ ] Card supports all required variants and interaction states.
- [ ] Modal is keyboard accessible and restores focus.
- [ ] Badge supports all required variants.
- [ ] Table supports populated, empty, loading, and error states.
- [ ] Spinner is accessible and CSS-animated.

### Pages

- [ ] Home includes hero, features, top courses, testimonial placeholders, CTA, and footer.
- [ ] About includes mission, differentiators, learning journey, and domain-informed explanation.
- [ ] Contact includes validation and mocked submission behavior.
- [ ] Style Guide displays every required component and state.
- [ ] Not Found page exists.

### Domain alignment

- [ ] Course cards use mock data derived from Course, Lesson, Quiz, and User relationships.
- [ ] Public UI does not expose `passwordHash` or quiz answers.
- [ ] Only published courses appear publicly.
- [ ] Enrollment, Progress, and Certificate concepts are represented only where appropriate for this release.

### Quality

- [ ] Pages are responsive from 320px upward.
- [ ] Keyboard navigation works.
- [ ] Reduced-motion preference is respected.
- [ ] Form errors are accessible.
- [ ] No production backend is required.
- [ ] Contact requests are intercepted locally.
- [ ] Core component and page tests pass.
- [ ] README contains installation, development, test, and build commands.

---

## 26. Deliverables

Codex must produce:

1. Complete monorepo source code.
2. `packages/ui` component library.
3. TailwindCSS shared theme/configuration.
4. Home, About, Contact, Style Guide, and Not Found pages.
5. Mock data mapped from the supplied class and ERD diagrams.
6. Mocked contact endpoint.
7. Tests for core components and contact behavior.
8. Documentation in `README.md` covering:
   - setup
   - available commands
   - workspace structure
   - design-token strategy
   - component import examples
   - mocked endpoint behavior
   - domain-to-frontend mapping
   - known out-of-scope features

---

## 27. Out of Scope

Do not implement:

- Real authentication or authorization.
- User registration or login.
- Admin or instructor dashboards.
- Course publishing controls.
- Course player.
- Quiz-taking interface.
- Persistent enrollment.
- Progress persistence.
- Certificate generation or verification.
- Payment or checkout.
- Real email delivery.
- Production API integration.
- Server-side rendering.
- JavaScript animation libraries.

The architecture should make these future features possible without pretending they are already complete.
