// Shared Tailwind classes for the quiz pages, taken from the "Quiz Engine UI" design

export const pillClass = "inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-extrabold ring-1 ring-inset"
export const pillBrandClass = `${pillClass} bg-brand-50 text-brand-700 ring-brand-200`
export const pillNeutralClass = `${pillClass} bg-canvas-warm text-ink-soft ring-line`
export const pillSuccessClass = `${pillClass} bg-success-light text-success-dark ring-success/20`
export const pillDangerClass = `${pillClass} bg-danger-light text-danger-dark ring-danger/20`
export const pillWarningClass = `${pillClass} bg-warning-light text-warning-dark ring-warning/25`

export const primaryButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-control bg-brand-600 font-bold text-white shadow-button transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
export const outlineButtonClass =
    "inline-flex items-center justify-center gap-2 rounded-control border border-line-strong bg-canvas font-bold text-ink transition hover:border-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-line-strong disabled:hover:bg-canvas"

export const eyebrowClass = "text-xs font-extrabold uppercase tracking-[0.1em] text-brand-600"
export const pageTitleClass = "font-display text-[28px] font-extrabold tracking-[-0.025em] text-ink"
export const cardClass = "rounded-card border border-line bg-canvas"
