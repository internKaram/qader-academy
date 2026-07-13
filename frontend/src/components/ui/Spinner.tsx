import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  label?: string;
  decorative?: boolean;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-[3px]',
  lg: 'size-9 border-4',
};

export function Spinner({
  size = 'md',
  label = 'Loading',
  decorative = false,
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      className={cn('inline-flex items-center justify-center align-middle', className)}
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative ? true : undefined}
      {...props}
    >
      <span
        className={cn(
          'ui-spinner block rounded-full border-current border-r-transparent text-brand-600',
          sizeClasses[size],
        )}
      />
      {!decorative ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
