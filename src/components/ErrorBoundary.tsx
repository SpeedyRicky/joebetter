import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    try {
      localStorage.removeItem('gemini_assistant_active_conv');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-100">
                Something unexpected occurred
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Craig encountered an interface error. You can refresh to restore your workspace.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 text-left">
                <p className="text-xs font-mono text-neutral-400 line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleResetState}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition cursor-pointer"
                title="Reset active chat if it was corrupted"
              >
                <Trash2 className="w-4 h-4 text-neutral-400" />
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
