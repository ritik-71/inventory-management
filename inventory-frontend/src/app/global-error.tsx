"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4 text-center font-sans">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Critical System Fault</h1>
          <p className="text-slate-400 max-w-lg mb-8 leading-relaxed">
            A fatal error has disrupted the root application shell. The system has automatically logged the stack trace for engineering review.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              Reboot Interface
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg font-medium transition-all"
            >
              Return to Gateway
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
