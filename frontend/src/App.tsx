import { StyleGuidePage } from './pages/StyleGuidePage';

function App() {
  const pathname = window.location.pathname;

  // Full React Router integration belongs to the later routing phase.
  if (pathname === '/style-guide') {
    return <StyleGuidePage />;
  }

  return (
    <main className="min-h-screen bg-canvas-soft py-20">
      <div className="page-container">
        <section className="rounded-panel bg-canvas-dark p-10 text-white shadow-lift">
          <p className="eyebrow">QaderAcademy</p>

          <h1 className="mt-4 font-display text-display-md">
            Learn practical skills with confidence
          </h1>

          <p className="mt-5 max-w-reading text-lead text-white/70">
            A modern educational platform built with a reusable design system.
          </p>

          <a
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-control bg-brand-600 px-6 py-3 font-bold text-white shadow-button transition hover:-translate-y-px hover:bg-brand-700"
            href="/style-guide"
          >
            View style guide
          </a>
        </section>
      </div>
    </main>
  );
}

export default App;
