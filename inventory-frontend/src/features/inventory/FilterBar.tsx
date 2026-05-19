"use client";

import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

interface FilterBarProps {
  categories: string[];
  onFilterChange: (filters: { search: string, category: string, status: string }) => void;
  onAddClick: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = React.memo(({ categories, onFilterChange, onAddClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    onFilterChange({ search: debouncedSearch, category, status });
  }, [debouncedSearch, category, status, onFilterChange]);

  return (
    <div className="filter-bar">
      <div className="input-icon-wrapper" style={{ flex: '1 1 300px' }}>
        <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          className="input input-with-icon" 
          placeholder="Search by name... (Debounced)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <select className="input" style={{ width: 'auto' }} value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      
      <select className="input" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="IN_STOCK">In Stock</option>
        <option value="LOW_STOCK">Low Stock</option>
        <option value="OUT_OF_STOCK">Out of Stock</option>
      </select>
      
      {(searchTerm || category || status) && (
        <button className="btn btn-outline" onClick={() => { setSearchTerm(""); setCategory(""); setStatus(""); }}>
          Clear
        </button>
      )}

      <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={onAddClick}>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </button>
    </div>
  );
});
