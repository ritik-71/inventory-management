"use client";

import { InventoryItem } from "../types/inventory";
import "../styles/table.css";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export default function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'IN_STOCK': return <span className="badge badge-success">In Stock</span>;
      case 'LOW_STOCK': return <span className="badge badge-warning">Low Stock</span>;
      case 'OUT_OF_STOCK': return <span className="badge badge-danger">Out of Stock</span>;
      default: return <span className="badge badge-info">{status}</span>;
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <svg style={{ width: '64px', height: '64px', color: 'var(--border)', marginBottom: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No inventory items found</h3>
        <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Supplier</th>
            <th>Date Added</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td style={{ color: 'var(--text-muted)' }}>#{item.id}</td>
              <td style={{ fontWeight: 600 }}>{item.name}</td>
              <td>{item.category}</td>
              <td style={{ color: item.quantity < 10 ? 'var(--danger)' : 'inherit', fontWeight: item.quantity < 10 ? 600 : 400 }}>
                {item.quantity}
              </td>
              <td>${(item.sellingPrice || 0).toFixed(2)}</td>
              <td>{item.supplier}</td>
              <td style={{ color: 'var(--text-muted)' }}>{formatDate(item.dateAdded)}</td>
              <td>{getStatusBadge(item.status)}</td>
              <td>
                <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn-icon" onClick={() => onEdit(item)} title="Edit Item">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="btn-icon danger" onClick={() => onDelete(item)} title="Delete Item">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
