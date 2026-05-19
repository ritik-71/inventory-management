"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-center p-4">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
        <h1 className="text-9xl font-bold text-white tracking-tighter relative z-10">404</h1>
      </div>
      <h2 className="text-2xl font-semibold text-slate-200 mb-4">Route Disconnected</h2>
      <p className="text-slate-400 max-w-md mb-8">
        The system interface you are attempting to access does not exist or has been relocated by a platform administrator.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
      >
        Return to Portal
      </Link>
    </div>
  );
}
