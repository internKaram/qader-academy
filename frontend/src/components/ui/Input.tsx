import { useId, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

type InputNativeProps = Omit<ComponentPropsWithoutRef<'input'>, 'size'>;
type TextareaNativeProps = Omit<ComponentPropsWithoutRef<'textarea'>, 'size'>;

interface BaseFieldProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  inputClassName?: string;
}

type InputProps = BaseFieldProps &
  (
    | ({ multiline?: false } & InputNativeProps)
    | ({ multiline: true } & TextareaNativeProps)
  );

export function Input(props: InputProps) {
  const generatedId = useId();
  const {
    label,
    hint,
    error,
    optional = false,
    inputClassName,
    className,
    id,
    required,
    multiline = false,
    ...fieldProps
  } = props;
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const fieldClasses = cn(
    'w-full rounded-control border bg-canvas px-4 py-3 text-sm text-ink shadow-sm transition placeholder:text-ink-muted/70 read-only:bg-canvas-soft focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/15 disabled:cursor-not-allowed disabled:bg-canvas-warm disabled:text-ink-muted',
    error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-line-strong',
    multiline && 'min-h-32 resize-y',
    inputClassName,
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-bold text-ink" htmlFor={fieldId}>
          {label}
        </label>
        {required ? <span className="text-xs font-bold text-brand-700">Required</span> : null}
        {!required && optional ? <span className="text-xs font-medium text-ink-muted">Optional</span> : null}
      </div>

      {multiline ? (
        <textarea
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={fieldClasses}
          {...(fieldProps as TextareaNativeProps)}
        />
      ) : (
        <input
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={fieldClasses}
          {...(fieldProps as InputNativeProps)}
        />
      )}

      {hint ? (
        <p className="text-sm text-ink-muted" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm font-semibold text-danger" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
