import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type CardVariant = 'surface' | 'elevated' | 'soft' | 'dark' | 'outline';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  surface: 'border border-line bg-canvas text-ink',
  elevated: 'border border-transparent bg-canvas text-ink shadow-card',
  soft: 'border border-line bg-canvas-warm text-ink',
  dark: 'border border-line-dark bg-canvas-dark text-white shadow-lift',
  outline: 'border border-line-strong bg-transparent text-ink',
};

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function CardRoot({
  variant = 'surface',
  padding = 'md',
  interactive = false,
  selected = false,
  disabled = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card transition duration-200 ease-out',
        variantClasses[variant],
        paddingClasses[padding],
        interactive && 'hover:-translate-y-1 hover:shadow-lift',
        selected && 'ring-2 ring-brand-600 ring-offset-2 ring-offset-canvas',
        disabled && 'pointer-events-none opacity-55',
        className,
      )}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('mb-4 space-y-2', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('mt-5 flex flex-wrap items-center gap-3', className)} {...props}>
      {children}
    </div>
  );
}

