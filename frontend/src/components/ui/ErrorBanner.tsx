import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
 
interface ErrorBannerProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  onRetry?: () => void;
}
 
export function ErrorBanner({ message, onRetry, className, ...props }: ErrorBannerProps) {
  if (!message) return null;
 
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center',
        className,
      )}
      {...props}
    >
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
        >
          Retry
        </button>
      )}
    </div>
  );
}
 