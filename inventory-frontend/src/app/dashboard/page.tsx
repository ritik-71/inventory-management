"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { InventoryProvider, useInventory } from "../../context/InventoryContext";
import { useAuth } from "../../context/AuthContext";
import { InventoryItem } from "../../types/inventory";
import { AnalyticsCards } from "../../features/inventory/AnalyticsCards";
import { Charts } from "../../features/inventory/Charts";
import { FilterBar } from "../../features/inventory/FilterBar";
import { InventoryTable } from "../../features/inventory/InventoryTable";
import AddItemModal from "../../features/inventory/AddItemModal";
import EditItemModal from "../../features/inventory/EditItemModal";
import DeleteConfirmModal from "../../features/inventory/DeleteConfirmModal";
import "../../styles/dashboard.css";

interface NotificationItem {
  id: number;
  text: string;
  type: "warning" | "success" | "info";
  read: boolean;
  time: string;
}

const DashboardContent = () => {
  const router = useRouter();
  const { items, createItem, editItem, removeItem, bulkRemoveItems } = useInventory();
  const { logout, email, name, role } = useAuth();
  
  // Tab navigation state: 'dashboard' | 'inventory' | 'settings'
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "settings">("dashboard");

  // Dynamic theme switching
  const [isDark, setIsDark] = useState(false);

  // Dropdown states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Refs for outside-click dismissals
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Mock Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      text: "Low stock alert: 'Smart Watch Pro' has dropped below threshold (2 left).",
      type: "warning",
      read: false,
      time: "5 mins ago"
    },
    {
      id: 2,
      text: "System status: Flyway schema migrations successfully baselined.",
      type: "success",
      read: false,
      time: "1 hour ago"
    },
    {
      id: 3,
      text: "Security profile active: Rate-limiting filter enabled on auth routes.",
      type: "info",
      read: false,
      time: "2 hours ago"
    }
  ]);

  // Mock Settings Config
  const [settings, setSettings] = useState({
    stockAlertMargin: 5,
    enableNotifications: true,
    dbPoolSize: 10,
    securityHardening: true
  });

  // Track unread counts
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  useEffect(() => {
    const isDarkTheme = document.documentElement.classList.contains("dark") || 
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    if (isDarkTheme) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // Global listener for outside-click menu dismissals
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // Filtering state
  const [filters, setFilters] = useState({ search: "", category: "", status: "" });

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleAdd = async (newItem: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
    await createItem(newItem);
    setIsAddOpen(false);
    
    // Auto-generate notification upon successful addition
    const newNotif: NotificationItem = {
      id: Date.now(),
      text: `Item added: '${newItem.name}' added successfully to catalog.`,
      type: "success",
      read: false,
      time: "Just now"
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleEdit = async (id: number, updatedData: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
    await editItem(id, updatedData);
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    await removeItem(selectedItem.id);
    setIsDeleteOpen(false);
    setSelectedItem(null);
  };

  // Derived data for filters
  const categories = useMemo(() => Array.from(new Set(items.map(i => i.category))), [items]);

  // Apply frontend filters
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filters.search) {
      result = result.filter(i => i.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.category) result = result.filter(i => i.category === filters.category);
    if (filters.status) result = result.filter(i => i.status === filters.status);
    return result;
  }, [items, filters]);

  // Notification actions
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="dashboard-layout">
      {/* Dynamic Header Navbar */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => setActiveTab("dashboard")} style={{ cursor: 'pointer' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Enterprise Inventory
        </div>
        
        <div className="navbar-user">
          {/* Theme Toggler */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Interactive Notifications Bell */}
          <div ref={notificationRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button 
              className="btn-icon" 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }}
              aria-label="View Notifications"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Tray Card */}
            {isNotificationOpen && (
              <div className="card" style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem' }}>System Alerts</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllNotificationsAsRead} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    No active notifications.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        style={{
                          padding: '0.625rem',
                          borderRadius: '8px',
                          background: notif.read ? 'transparent' : 'rgba(37,99,235,0.06)',
                          borderLeft: `4px solid ${
                            notif.type === 'warning' ? 'var(--warning)' : notif.type === 'success' ? 'var(--success)' : 'var(--primary)'
                          }`,
                          fontSize: '0.75rem',
                          position: 'relative'
                        }}
                      >
                        <p style={{ color: 'var(--text-main)', paddingRight: '1rem', lineHeight: '1.4' }}>{notif.text}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                          <span>{notif.time}</span>
                          <button 
                            onClick={() => clearNotification(notif.id)} 
                            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Profile Area */}
          <div ref={profileRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                {name || email || "Operator"}
              </span>
              <div className="avatar">
                {(name || email || "O").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Profile Dropdown panel */}
            {isProfileOpen && (
              <div className="card" style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '240px',
                zIndex: 1000,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{name || "Enterprise Operator"}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{email}</p>
                  <span className="badge badge-success" style={{ marginTop: '0.45rem', fontSize: '10px' }}>
                    {role || "ROLE_USER"}
                  </span>
                </div>
                
                <button 
                  onClick={() => { setActiveTab("settings"); setIsProfileOpen(false); }}
                  className="sidebar-link"
                  style={{ background: 'transparent', border: 'none', width: '100%', padding: '0.45rem 0.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                  <span>Account Settings</span>
                </button>

                <button 
                  onClick={logout} 
                  className="btn btn-danger w-full" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.45rem' }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Area */}
      <div className="dashboard-body">
        {/* Dynamic Interactive Sidebar */}
        <aside className="sidebar">
          <div 
            className={`sidebar-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span>Dashboard</span>
          </div>
          <div 
            className={`sidebar-link ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <span>Inventory</span>
          </div>
          <div 
            className={`sidebar-link ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>Settings</span>
          </div>
        </aside>

        {/* Dynamic Display Render */}
        <main className="main-content">
          {activeTab === "dashboard" && (
            <>
              <AnalyticsCards />
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <Charts />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                  <FilterBar 
                    categories={categories}
                    onFilterChange={setFilters}
                    onAddClick={() => setIsAddOpen(true)}
                  />
                  <InventoryTable 
                    items={filteredItems} 
                    onEdit={(item) => { setSelectedItem(item); setIsEditOpen(true); }}
                    onDelete={(item) => { setSelectedItem(item); setIsDeleteOpen(true); }}
                    onBulkDelete={bulkRemoveItems}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "inventory" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Inventory Management</h2>
                <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
                  Add New Item
                </button>
              </div>
              <FilterBar 
                categories={categories}
                onFilterChange={setFilters}
                onAddClick={() => setIsAddOpen(true)}
              />
              <InventoryTable 
                items={filteredItems} 
                onEdit={(item) => { setSelectedItem(item); setIsEditOpen(true); }}
                onDelete={(item) => { setSelectedItem(item); setIsDeleteOpen(true); }}
                onBulkDelete={bulkRemoveItems}
              />
            </div>
          )}

          {activeTab === "settings" && (
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
          )}
        </main>
      </div>

      {/* CRUD Dialog Modals */}
      <AddItemModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
      
      <EditItemModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onEdit={handleEdit} 
        item={selectedItem} 
      />
      
      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDelete}
        itemName={selectedItem?.name || ""}
      />
    </div>
  );
};

export default function DashboardPage() {
  return (
    <InventoryProvider>
      <DashboardContent />
    </InventoryProvider>
  );
}
