"use client";

import React, { useMemo } from 'react';
import { useInventory } from '../../hooks/useInventory';

export const AnalyticsCards: React.FC = () => {
  const { items, loading } = useInventory();

  const analytics = useMemo(() => {
    return {
      totalItems: items.length,
      inventoryValue: items.reduce((sum, item) => sum + ((item.sellingPrice || 0) * item.quantity), 0),
      lowStock: items.filter(i => i.quantity > 0 && i.quantity < 10).length,
      outOfStock: items.filter(i => i.quantity === 0).length,
    };
  }, [items]);

  if (loading) {
    return (
      <div className="summary-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="summary-card" style={{ gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '14px', width: '60%', background: '#e2e8f0', marginBottom: '0.5rem', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
              <div style={{ height: '24px', width: '40%', background: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="summary-grid">
      <div className="summary-card">
        <div className="summary-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <div className="summary-info">
          <span className="summary-label">Total Items</span>
          <span className="summary-value">{analytics.totalItems}</span>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="summary-info">
          <span className="summary-label">Inventory Value</span>
          <span className="summary-value">${analytics.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div className="summary-info">
          <span className="summary-label">Low Stock</span>
          <span className="summary-value">{analytics.lowStock}</span>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="summary-info">
          <span className="summary-label">Out of Stock</span>
          <span className="summary-value">{analytics.outOfStock}</span>
        </div>
      </div>
    </div>
  );
};
