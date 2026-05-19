"use client";

import React, { useMemo } from 'react';
import { useInventory } from '../../hooks/useInventory';

export const Charts: React.FC = () => {
  const { items, loading } = useInventory();

  const categoryDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    items.forEach(item => {
      dist[item.category] = (dist[item.category] || 0) + 1;
    });
    const total = items.length;
    return Object.entries(dist)
      .map(([name, count]) => ({ name, count, percent: total > 0 ? (count / total) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  if (loading || items.length === 0) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem' }}>Category Distribution</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {categoryDistribution.map(cat => (
          <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ width: '120px', fontSize: '0.875rem', fontWeight: 500 }}>{cat.name}</span>
            <div style={{ flex: 1, height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${cat.percent}%`, 
                  background: 'var(--primary)', 
                  transition: 'width 0.5s ease-out' 
                }} 
              />
            </div>
            <span style={{ width: '40px', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {cat.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
