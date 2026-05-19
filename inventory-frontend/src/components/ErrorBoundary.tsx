"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    // Structured, safe logging for cloud trace diagnostic collection
    console.error("Runtime Crash Caught by ErrorBoundary:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }

      return (
        <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />
          
          <div className="relative max-w-md w-full border border-red-500/20 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-8 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              System Crash Intercepted
            </h1>
            
            <p className="text-sm text-slate-400 mb-6">
              An unexpected runtime transaction fault occurred. The secure container sandbox prevented a site-wide crash.
            </p>

            {this.state.error && (
              <div className="text-left bg-black/40 border border-slate-800 rounded-lg p-3 mb-6 overflow-x-auto">
                <p className="text-[11px] font-mono text-red-300 whitespace-pre-wrap leading-relaxed">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}
            
            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer"
            >
              Reset Session State
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private get fallback() {
    return this.props.fallback;
  }
}
