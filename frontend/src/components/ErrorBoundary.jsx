import { Component } from 'react';
import { AlertOctagon } from 'lucide-react';
import Button from './ui/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log for developers; never shown to the user
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-ink-950">
          <AlertOctagon className="w-14 h-14 text-red-400 mb-5" />
          <h1 className="text-xl font-bold text-ink-100 mb-2">Something went wrong</h1>
          <p className="text-ink-400 max-w-sm mb-6">
            We hit an unexpected error. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
