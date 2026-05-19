"use client";

import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../../types/inventory';
import '../../styles/table.css';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onBulkDelete: (ids: number[]) => void;
  hideActions?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortField: string, sortOrder: string) => void;
}

type SortField = 'id' | 'name' | 'quantity' | 'sellingPrice' | 'dateAdded';
type SortOrder = 'asc' | 'desc';

export const InventoryTable: React.FC<InventoryTableProps> = React.memo(({ 
  items, onEdit, onDelete, onBulkDelete, hideActions,
  currentPage = 1, totalPages = 1, onPageChange, onSortChange 
}) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  const handleSort = (field: SortField) => {
    let newOrder: SortOrder = 'desc';
    if (sortField === field) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSortField(field);
    setSortOrder(newOrder);
    if (onSortChange) onSortChange(field, newOrder);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Reset selection if dataset changes significantly
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [items]);

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
    return date.toLocaleDateString();
  };

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
      {selectedIds.size > 0 && (
        <div style={{ padding: '0.75rem 1.25rem', background: '#eff6ff', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>{selectedIds.size} items selected</span>
          <button className="btn btn-danger" onClick={() => onBulkDelete(Array.from(selectedIds))} style={{ padding: '0.4rem 0.8rem' }}>
            Bulk Delete
          </button>
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleSelectAll} />
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('id')}>ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            <th>Category</th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('quantity')}>Qty {sortField === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('sellingPrice')}>Price {sortField === 'sellingPrice' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            <th>Supplier</th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('dateAdded')}>Date {sortField === 'dateAdded' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            <th>Status</th>
            {!hideActions && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ background: selectedIds.has(item.id) ? '#f8fafc' : undefined }}>
              <td>
                <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} />
              </td>
              <td style={{ color: 'var(--text-muted)' }}>#{item.id}</td>
              <td style={{ fontWeight: 600 }}>{item.name}</td>
              <td>{item.category}</td>
              <td style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: '8px', left: '1.25rem', right: '1.25rem', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((item.quantity / 100) * 100, 100)}%`, background: item.quantity < 10 ? 'var(--danger)' : 'var(--success)' }} />
                </div>
                <span style={{ color: item.quantity < 10 ? 'var(--danger)' : 'inherit', fontWeight: item.quantity < 10 ? 600 : 400, position: 'relative', top: '-6px' }}>
                  {item.quantity}
                </span>
              </td>
              <td>${(item.sellingPrice || 0).toFixed(2)}</td>
              <td>{item.supplier}</td>
              <td style={{ color: 'var(--text-muted)' }}>{formatDate(item.dateAdded)}</td>
              <td>{getStatusBadge(item.status)}</td>
              {!hideActions && (
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
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', background: '#fff' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline" disabled={currentPage <= 1} onClick={() => onPageChange && onPageChange(currentPage - 1)}>Previous</button>
            <button className="btn btn-outline" disabled={currentPage >= totalPages} onClick={() => onPageChange && onPageChange(currentPage + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
});
