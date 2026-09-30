import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }) {
  return <Loader2 className={`w-6 h-6 animate-spin text-gold-400 ${className}`} />;
}

export function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Spinner className="w-8 h-8" />
      <p className="text-ink-400 text-sm">{label}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-ink-800 animate-pulse">
      <div className="aspect-[3/4] bg-ink-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-ink-800 rounded w-2/3" />
        <div className="h-3 bg-ink-800 rounded w-1/3" />
      </div>
    </div>
  );
}
