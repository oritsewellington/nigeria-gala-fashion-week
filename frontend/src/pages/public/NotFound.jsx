import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Compass className="w-16 h-16 text-gold-500/40 mb-6" />
      <h1 className="text-6xl font-bold font-display text-gradient-gold mb-3">404</h1>
      <h2 className="text-xl font-semibold text-ink-100 mb-2">Page not found</h2>
      <p className="text-ink-400 max-w-sm mb-8">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
