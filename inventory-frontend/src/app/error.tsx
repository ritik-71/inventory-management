"use client";

import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-900/40 backdrop-blur rounded-2xl border border-slate-800 m-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Something went wrong inside the page tree!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </ErrorBoundary>
  );
}
