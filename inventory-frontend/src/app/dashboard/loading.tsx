"use client";

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#030712] text-white p-6 md:p-8 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800/60">
        <div>
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-slate-800 rounded-lg animate-pulse" />
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i}
            className="border border-slate-800/60 bg-slate-900/40 backdrop-blur rounded-xl p-5 shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            <div className="flex justify-between items-start mb-4">
              <div className="h-4 w-28 bg-slate-800 rounded animate-pulse" />
              <div className="h-8 w-8 bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-slate-800 rounded-lg animate-pulse mb-2" />
            <div className="h-3 w-36 bg-slate-800/60 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table Card Grid Skeleton */}
      <div className="border border-slate-800/60 bg-slate-900/40 backdrop-blur rounded-xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-full sm:w-64 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 py-2">
                <div className="h-10 w-10 bg-slate-800 rounded-lg animate-pulse shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-4 w-1/3 bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-slate-800/60 rounded animate-pulse" />
                </div>
                <div className="h-4 w-20 bg-slate-800 rounded animate-pulse shrink-0" />
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
