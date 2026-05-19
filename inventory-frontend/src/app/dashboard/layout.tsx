"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { InventoryProvider } from "../../context/InventoryContext";
import { useAuth } from "../../context/AuthContext";
import { apiInstance } from "../../utils/apiClient";
import "../../styles/dashboard.css";

interface NotificationItem {
  id: number;
  text: string;
  type: "warning" | "success" | "info";
  read: boolean;
  time: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, email, name, role, loading: authLoading, isAuthenticated } = useAuth();
  
  // Dynamic theme switching
  const [isDark, setIsDark] = useState(false);

  // Dropdown states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Refs for outside-click dismissals
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Real Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch of existing notifications
    fetchNotifications();

    // Establish Server-Sent Events (SSE) connection
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    // EventSource does not support custom headers (like Authorization), so we must rely on our secure cookies
    // Note: withCredentials: true is required for cookies to be passed cross-origin
    const eventSource = new EventSource(`${API_BASE_URL}/api/notifications/stream`, {
      withCredentials: true
    });

    eventSource.onopen = () => {
      console.log("SSE Connection to Real-Time Notification Stream established.");
    };

    eventSource.addEventListener("CONNECT", (e: any) => {
      console.log("SSE Connect Event:", e.data);
    });

    eventSource.addEventListener("NOTIFICATION", (e: any) => {
      try {
        const newNotif = JSON.parse(e.data);
        setNotifications((prev) => [newNotif, ...prev]);
      } catch (err) {
        console.error("Failed to parse incoming real-time notification", err);
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error. Attempting to reconnect...", err);
      // EventSource auto-reconnects natively
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await apiInstance.get('/api/notifications');
      setNotifications(response as unknown as NotificationItem[]);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

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
      if (isMobileSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        // Only close mobile sidebar if clicking outside of it (but don't close if clicking hamburger)
        const target = e.target as HTMLElement;
        if (!target.closest('.hamburger-btn')) {
          setIsMobileSidebarOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMobileSidebarOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

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

  const markAllNotificationsAsRead = async () => {
    try {
      await apiInstance.put('/api/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all read", error);
    }
  };

  const clearNotification = async (id: number) => {
    try {
      await apiInstance.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4" />
          <p className="text-slate-400 text-sm font-mono tracking-wider animate-pulse">VERIFYING DEPLOYMENT SECURITY...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null; // Middleware will handle redirect

  return (
    <InventoryProvider>
      <div className="dashboard-layout">
        {/* Dynamic Header Navbar */}
        <header className="navbar" style={{ zIndex: 1050 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="hamburger-btn btn-icon d-md-none" 
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              style={{ display: 'none', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="navbar-brand" onClick={() => router.push("/dashboard")} style={{ cursor: 'pointer' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Enterprise Inventory
            </div>
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
                <span className="d-none d-md-block" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                  {name || email || "Operator"}
                </span>
                <div className="avatar">
                  {(name || email || "O").charAt(0).toUpperCase()}
                </div>
              </div>

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
                  
                  <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} style={{ textDecoration: 'none' }}>
                    <button 
                      className="sidebar-link w-full"
                      style={{ background: 'transparent', border: 'none', width: '100%', padding: '0.45rem 0.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                      <span>Account Settings</span>
                    </button>
                  </Link>

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

        <div className="dashboard-body">
          {/* Mobile Overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="sidebar-overlay d-md-none"
              onClick={() => setIsMobileSidebarOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1030,
                animation: 'fadeIn 0.2s ease'
              }}
            />
          )}

          {/* Dynamic Interactive Sidebar */}
          <aside 
            ref={sidebarRef}
            className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
            style={{ zIndex: 1040 }}
          >
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <div className={`sidebar-link ${pathname === "/dashboard" ? "active" : ""}`}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                <span>Analytics</span>
              </div>
            </Link>
            
            <Link href="/dashboard/inventory" style={{ textDecoration: 'none' }}>
              <div className={`sidebar-link ${pathname === "/dashboard/inventory" ? "active" : ""}`}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <span>Inventory</span>
              </div>
            </Link>

            {/* Role-based rendering: Only ADMIN can see settings */}
            {role === "ROLE_ADMIN" && (
              <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                <div className={`sidebar-link ${pathname === "/dashboard/settings" ? "active" : ""}`}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Settings</span>
                </div>
              </Link>
            )}
          </aside>

          {/* Render Nested Page Content via children prop */}
          <main className="main-content">
            {children}
          </main>
        </div>
      </div>
    </InventoryProvider>
  );
}
