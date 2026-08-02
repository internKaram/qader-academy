import { useEffect, useId, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  className,
  children,
  ...props
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusableElements(dialogRef.current);
      const target = focusable[0] ?? dialogRef.current;
      target?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements(dialogRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm transition-opacity motion-reduce:transition-none"
      onMouseDown={handleBackdropClick}
    >
      <div
        className={cn(
          'max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-panel bg-canvas p-6 text-ink shadow-lift transition duration-200 motion-reduce:transition-none sm:p-8',
          sizeClasses[size],
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h2 className="font-display text-heading-sm" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="text-sm leading-6 text-ink-soft" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-control text-ink-muted transition hover:bg-canvas-warm hover:text-ink"
            type="button"
            aria-label="Close modal"
            onClick={onClose}
          >
            <span aria-hidden="true">x</span>
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
export default Modal;