"use client";

import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { role } = useAuth();
  const router = useRouter();

  if (role !== "ROLE_ADMIN") {
    // Basic role protection (middleware adds another layer)
    if (typeof window !== 'undefined') {
      router.push("/dashboard");
    }
    return null;
  }

  const [settings, setSettings] = useState({
    stockAlertMargin: 5,
    enableNotifications: true,
    dbPoolSize: 10,
    securityHardening: true
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2>Portal Configuration</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Tweak system alarms, alerts thresholds, security contexts, and database connection pools.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Stock Alarm Config Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Stock Alerts
          </h3>
          <div>
            <label className="label">Low Stock Margin Threshold</label>
            <input 
              type="number" 
              className="input" 
              value={settings.stockAlertMargin}
              onChange={e => setSettings(prev => ({ ...prev, stockAlertMargin: parseInt(e.target.value, 10) || 5 }))}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Generates dashboard alerts when inventory volumes fall below this amount.
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Enable Real-time Popups</span>
            <input 
              type="checkbox" 
              checked={settings.enableNotifications} 
              onChange={e => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* DB Pool Config Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Hikari Connection Pool
          </h3>
          <div>
            <label className="label">Maximum Connection Pool Size</label>
            <input 
              type="number" 
              className="input" 
              value={settings.dbPoolSize}
              onChange={e => setSettings(prev => ({ ...prev, dbPoolSize: parseInt(e.target.value, 10) || 10 }))}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Specifies optimal database query parallel channels (default 10).
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Enforce JWT Cookie Strictness</span>
            <input 
              type="checkbox" 
              checked={settings.securityHardening} 
              onChange={e => setSettings(prev => ({ ...prev, securityHardening: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Save Settings Trigger */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button 
          className="btn btn-primary"
          onClick={() => alert("Enterprise settings committed successfully to memory!")}
        >
          Save Configurations
        </button>
      </div>
    </div>
  );
}
