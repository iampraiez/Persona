import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Check for chunk load error (deployment updates)
    if (error.message.includes("Failed to fetch dynamically imported module") || 
        error.message.includes("Importing a module script failed")) {
      const storageKey = "chunk_load_error_reload";
      const lastReload = sessionStorage.getItem(storageKey);
      
      if (!lastReload) {
        sessionStorage.setItem(storageKey, "true");
        window.location.reload();
      } else {
        // Clear flag so next time it can try again (e.g. user manually refreshed)
        // But for this session, we show the error UI to avoid loop
        sessionStorage.removeItem(storageKey); 
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-md w-full bg-card/50 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl relative z-10 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-8 h-8 text-destructive" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-foreground/60 mb-8">
              An unexpected error occurred. We've been notified and are working on it.
            </p>

            {this.state.error && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-8 text-left overflow-hidden">
                <p className="text-xs font-mono text-foreground/40 uppercase mb-2 tracking-wider">Error Details</p>
                <code className="text-sm text-foreground/80 break-words block">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-accent text-accent-foreground rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-accent/20"
              >
                Try refreshing
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-4 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all"
              >
                Back to safety
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
