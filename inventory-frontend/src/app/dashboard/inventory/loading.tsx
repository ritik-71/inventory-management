"use client";

import React from 'react';

export default function InventoryLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ height: '28px', width: '220px', background: 'var(--surface)', borderRadius: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: '40px', width: '140px', background: 'var(--surface)', borderRadius: '8px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      </div>

      {/* Filter bar skeleton */}
      <div className="card" style={{ height: '56px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

      {/* Table skeleton */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ height: '48px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} />
        {/* Table rows */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            height: '56px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.25rem',
            gap: '2rem'
          }}>
            <div style={{ height: '14px', width: '30px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 100}ms` }} />
            <div style={{ height: '14px', width: '120px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 100}ms` }} />
            <div style={{ height: '14px', width: '80px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 100}ms` }} />
            <div style={{ height: '14px', flex: 1, background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 100}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
