import type { ReactNode } from "react"
import { ArrowLeft, Compass, Home, ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"
import statusThinkingLearner from "../assets/status-thinking-learner.png"
import { SiteChrome } from "../components/SiteChrome"

type StatusKind = "forbidden" | "not-found"

interface StatusPageProps {
  kind: StatusKind
}

const pageContent: Record<
  StatusKind,
  {
    code: string
    label: string
    title: string
    description: string
    icon: ReactNode
    primaryAction: { label: string; to: string }
    secondaryAction: { label: string; to: string }
  }
> = {
  forbidden: {
    code: "403",
    label: "Access restricted",
    title: "This learning space isn't available to you.",
    description: "Your account doesn't have permission to open this page. Sign in with another account or return to a page you can access.",
    icon: <ShieldAlert className="size-7" aria-hidden="true" />,
    primaryAction: { label: "Sign in", to: "/login" },
    secondaryAction: { label: "Return home", to: "/" },
  },
  "not-found": {
    code: "404",
    label: "Page not found",
    title: "That path doesn't lead to a lesson.",
    description: "The page may have moved, or the address may be incomplete. Pick up your learning from the course catalog instead.",
    icon: <Compass className="size-7" aria-hidden="true" />,
    primaryAction: { label: "Browse courses", to: "/courses" },
    secondaryAction: { label: "Return home", to: "/" },
  },
}

export function StatusPage({ kind }: StatusPageProps) {
  const content = pageContent[kind]

  return (
    <SiteChrome className="min-h-screen bg-canvas-soft text-ink">
      <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center overflow-hidden py-28 sm:py-32">
        <div className="absolute -left-24 top-20 size-72 rounded-full bg-brand-100/75" aria-hidden="true" />
        <div className="absolute bottom-16 right-[-3rem] size-64 rounded-full border-[1.5rem] border-[#dff3ea]" aria-hidden="true" />
        <div className="absolute right-[12%] top-28 grid grid-cols-4 gap-2 opacity-50" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, index) => (
            <span className="size-1.5 rounded-full bg-brand-400" key={index} />
          ))}
        </div>

        <div className="page-container relative">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(22rem,0.65fr)] lg:gap-20">
            <section aria-labelledby={`${kind}-title`}>
              <div className="inline-flex items-center gap-2 rounded-pill bg-white px-3.5 py-2 text-sm font-extrabold text-brand-700 shadow-card">
                {content.icon}
                <span>{content.label}</span>
              </div>
              <p className="mt-8 font-display text-[clamp(5rem,17vw,11rem)] font-black leading-[0.72] tracking-[-0.09em] text-brand-600">
                {content.code}
              </p>
              <h1 id={`${kind}-title`} className="mt-9 max-w-2xl font-display text-heading-lg text-ink sm:text-[3.2rem] sm:leading-[1.02]">
                {content.title}
              </h1>
              <p className="mt-5 max-w-reading text-lead text-ink-soft">{content.description}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={content.primaryAction.to}
                  className="inline-flex min-h-13 items-center justify-center gap-3 rounded-control bg-brand-600 px-6 text-base font-bold text-white shadow-button transition hover:-translate-y-px hover:bg-brand-700"
                >
                  {content.primaryAction.label}
                  <ArrowLeft className="size-5 rotate-180" aria-hidden="true" />
                </Link>
                <Link
                  to={content.secondaryAction.to}
                  className="inline-flex min-h-13 items-center justify-center gap-3 rounded-control border border-line-strong bg-white px-6 text-base font-bold text-ink transition hover:-translate-y-px hover:border-brand-600 hover:bg-brand-50"
                >
                  <Home className="size-5" aria-hidden="true" />
                  {content.secondaryAction.label}
                </Link>
              </div>
            </section>

            <img
              className="mx-auto w-full max-w-xl self-end"
              src={statusThinkingLearner}
              alt="A learner thoughtfully working at a desk"
            />
          </div>
        </div>
      </main>
    </SiteChrome>
  )
}
