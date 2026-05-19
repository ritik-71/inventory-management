"use client";

import React, { useState, useEffect } from 'react';
import { apiInstance } from '../../utils/apiClient';

export const Charts: React.FC = () => {
  const [categories, setCategories] = useState<{name: string, count: number, percent: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data: any = await apiInstance.get('/api/items/analytics');
        if (data.categoryInsights) {
          const dist = data.categoryInsights;
          const total = Object.values(dist).reduce((acc: any, val: any) => acc + val, 0) as number;
          const formatted = Object.entries(dist)
            .map(([name, count]) => ({ 
              name, 
              count: count as number, 
              percent: total > 0 ? ((count as number) / total) * 100 : 0 
            }))
            .sort((a, b) => b.count - a.count);
          setCategories(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch chart analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || categories.length === 0) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem' }}>Category Distribution</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {categories.map(cat => (
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
