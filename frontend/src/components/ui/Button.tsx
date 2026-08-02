import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  iconOnly?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-button hover:bg-brand-700 focus-visible:outline-brand-600/45',
  secondary: 'bg-ink text-white shadow-card hover:bg-ink-soft focus-visible:outline-ink/35',
  outline: 'ui-button-outline border border-line-strong bg-transparent text-ink hover:border-brand-600 hover:bg-brand-50 hover:text-ink',
  ghost: 'ui-button-ghost bg-transparent text-ink hover:bg-canvas-warm hover:text-ink',
  danger: 'bg-danger text-white shadow-button hover:bg-danger-dark focus-visible:outline-danger/45',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 gap-2 px-3 text-sm',
  md: 'min-h-11 gap-2.5 px-5 text-sm',
  lg: 'min-h-13 gap-3 px-6 text-base',
};

const iconOnlyClasses: Record<ButtonSize, string> = {
  sm: 'size-9 px-0',
  md: 'size-11 px-0',
  lg: 'size-13 px-0',
};

const spinnerSize: Record<ButtonSize, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  iconOnly = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-control font-bold transition duration-200 ease-out hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55',
        'ui-button',
        variantClasses[variant],
        sizeClasses[size],
        iconOnly && iconOnlyClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={spinnerSize[size]} label="Loading" decorative />
        </span>
      ) : null}

      <span className={cn('inline-flex items-center justify-center gap-[inherit]', loading && 'invisible')}>
        {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
        {!iconOnly ? <span>{children}</span> : children}
        {trailingIcon ? <span aria-hidden="true">{trailingIcon}</span> : null}
      </span>
    </button>
  );
}
