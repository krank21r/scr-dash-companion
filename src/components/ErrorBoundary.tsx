import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Catches render-time errors (including failed lazy-chunk loads after a
 * stale deploy) and shows a recoverable screen instead of a white page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'Unexpected error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              The page failed to render. This can happen after an app update —
              reloading usually fixes it.
            </p>
            {this.state.message && (
              <p className="mt-2 text-xs text-slate-400 font-mono break-all max-w-md">
                {this.state.message}
              </p>
            )}
          </div>
          <Button onClick={this.handleReload} className="gap-2">
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reload app
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
