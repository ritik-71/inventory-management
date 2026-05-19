"use client";

import React from "react";
import { AnalyticsCards } from "../../features/inventory/AnalyticsCards";
import dynamic from 'next/dynamic';
import { useInventory } from "../../context/InventoryContext";

const Charts = dynamic(() => import('../../features/inventory/Charts').then(mod => mod.Charts), {
  ssr: false,
  loading: () => <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}><span style={{ color: 'var(--text-muted)' }}>Loading Analytics Charts...</span></div>
});
import { InventoryTable } from "../../features/inventory/InventoryTable";

export default function DashboardPage() {
  const { items } = useInventory();

  // Show a preview of the latest 5 items on the analytics page
  const recentItems = [...(items || [])].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>System Analytics</h2>
      </div>
      
      <AnalyticsCards />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start', marginTop: '1.5rem' }}>
        <Charts />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Recent Additions</h3>
            <InventoryTable 
              items={recentItems} 
              onEdit={() => {}} 
              onDelete={() => {}} 
              onBulkDelete={() => {}} 
              hideActions={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
