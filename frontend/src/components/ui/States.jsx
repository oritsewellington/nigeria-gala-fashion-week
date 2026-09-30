import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import Button from './Button';

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message = '' }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-14 h-14 rounded-full bg-ink-800 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-ink-400" />
      </div>
      <h3 className="text-lg font-semibold text-ink-100 font-display">{title}</h3>
      {message && <p className="text-ink-400 text-sm mt-1 max-w-sm">{message}</p>}
    </div>
  );
}

/**
 * Displays the clean, safe error message the backend already normalized
 * (never a raw DB/stack trace) with a retry action.
 */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-ink-100 font-display">Something went wrong</h3>
      <p className="text-ink-400 text-sm mt-1 max-w-sm">
        {message || 'Something went wrong on our end. Please try again shortly.'}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry} className="mt-5">
          Try again
        </Button>
      )}
    </div>
  );
}
