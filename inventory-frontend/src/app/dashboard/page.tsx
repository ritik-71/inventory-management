"use client";

import React, { useState, useMemo, useEffect } from "react";
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

const DashboardContent = () => {
  const router = useRouter();
  const { items, createItem, editItem, removeItem, bulkRemoveItems } = useInventory();
  const { logout, email } = useAuth();
  
  // Dynamic theme switching
  const [isDark, setIsDark] = useState(false);

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

  return (
    <div className="dashboard-layout">
      <header className="navbar">
        <div className="navbar-brand">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Enterprise Inventory
        </div>
        <div className="navbar-user">
          {/* Interactive Light/Dark Theme Switcher */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme}
            style={{ marginRight: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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

          <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }} />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>{email || "Operator"}</span>
          <div className="avatar">{(email || "O").charAt(0).toUpperCase()}</div>
          <button className="btn btn-outline" style={{ marginLeft: '1rem' }} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          <div className="sidebar-link active">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            <span>Dashboard</span>
          </div>
          <div className="sidebar-link">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <span>Inventory</span>
          </div>
          <div className="sidebar-link">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>Settings</span>
          </div>
        </aside>

        <main className="main-content">
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
        </main>
      </div>

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
