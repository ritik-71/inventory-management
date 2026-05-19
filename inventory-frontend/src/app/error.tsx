"use client";

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, this would pipe to Sentry
    console.error("Route Error Intercepted:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-red-500/20 rounded-xl my-8 mx-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--danger)">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-200 mb-2">Module Rendering Failure</h2>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        A runtime exception occurred while attempting to render this interface. The system has isolated the fault to prevent cascading failures.
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg font-medium transition-colors"
      >
        Attempt Recovery
      </button>
    </div>
  );
}
