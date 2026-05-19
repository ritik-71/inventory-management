"use client";

import React from 'react';

export default function DashboardLoading() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ height: '32px', width: '200px', background: 'var(--surface)', borderRadius: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: '40px', width: '120px', background: 'var(--surface)', borderRadius: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card" style={{ height: '140px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        ))}
      </div>

      <div className="card" style={{ height: '400px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
    </div>
  );
}
