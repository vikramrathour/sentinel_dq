import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ---------------------------------------------------------------------------
// ErrorBoundary — class component (required for componentDidCatch)
// ---------------------------------------------------------------------------

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Surface to any external error reporter if provided via props
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Allow consumers to supply a completely custom fallback
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          reset: this.handleReset,
        });
      }

      const errorMessage =
        this.state.error?.message ?? 'An unexpected error occurred.';

      return (
        <div className="flex items-center justify-center min-h-[200px] p-6">
          <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-xl shadow-sm p-6 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="text-red-500 shrink-0" size={40} aria-hidden="true" />

            <div className="space-y-1">
              <h2 className="text-base font-semibold text-red-700 leading-tight">
                Something went wrong
              </h2>
              <p className="text-sm text-red-600 break-words">{errorMessage}</p>
            </div>

            {this.state.errorInfo && (
              <details className="w-full text-left">
                <summary className="text-xs text-red-400 cursor-pointer select-none hover:text-red-600 transition-colors">
                  View stack trace
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-red-100 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}

// ---------------------------------------------------------------------------
// HOC wrapper
// ---------------------------------------------------------------------------

export function withErrorBoundary(Component, boundaryProps = {}) {
  const displayName = Component.displayName ?? Component.name ?? 'Component';

  function WrappedWithBoundary(props) {
    return (
      <ErrorBoundary {...boundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  WrappedWithBoundary.displayName = `withErrorBoundary(${displayName})`;
  return WrappedWithBoundary;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default ErrorBoundary;
