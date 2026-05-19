"use client";

import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
      minHeight: '60vh'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'rgba(37,99,235,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--primary)">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        Module Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        The dashboard section you requested does not exist. It may have been moved or is not available for your account role.
      </p>
      <Link href="/dashboard" style={{ textDecoration: 'none' }}>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Analytics
        </button>
      </Link>
    </div>
  );
}
