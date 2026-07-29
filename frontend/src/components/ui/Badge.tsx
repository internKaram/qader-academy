import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  leadingIcon?: ReactNode;
  onRemove?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  removeLabel?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-canvas-warm text-ink-soft ring-line',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  success: 'bg-success-light text-success-dark ring-success/20',
  warning: 'bg-warning-light text-warning-dark ring-warning/25',
  danger: 'bg-danger-light text-danger-dark ring-danger/20',
  info: 'bg-info-light text-info-dark ring-info/20',
  outline: 'bg-transparent text-ink ring-line-strong',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'min-h-6 px-2 text-xs',
  md: 'min-h-7 px-2.5 text-sm',
};

export function Badge({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  leadingIcon,
  onRemove,
  removeLabel = 'Remove badge',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-pill font-bold ring-1 ring-inset',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {dot ? <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" /> : null}
      {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
      <span className="truncate">{children}</span>
      {onRemove ? (
        <button
          className="-mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-current transition hover:bg-black/10 focus-visible:outline-current"
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <span aria-hidden="true">x</span>
        </button>
      ) : null}
    </span>
  );
}
