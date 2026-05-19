"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { InventoryItem } from '../types/inventory';
import { getItems, addItem, updateItem, deleteItem } from '../services/api';
import { useToast } from './ToastContext';

interface InventoryContextType {
  items: InventoryItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  fetchItems: (search?: string, page?: number, sort?: string) => Promise<void>;
  createItem: (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => Promise<void>;
  editItem: (id: number, item: Omit<InventoryItem, 'id' | 'dateAdded'>) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  bulkRemoveItems: (ids: number[]) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentSort, setCurrentSort] = useState<string>('id,desc');
  const [currentSearch, setCurrentSearch] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchItems = useCallback(async (search?: string, page: number = 0, sort?: string) => {
    // Cancel any in-flight request to prevent stale data overwrites
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const activeSearch = search !== undefined ? search : currentSearch;
      const activeSort = sort !== undefined ? sort : currentSort;
      
      const data = await getItems(activeSearch, page, 10, activeSort);
      
      // Only update state if this request wasn't cancelled
      if (!controller.signal.aborted) {
        setItems(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setCurrentPage(data.number);
        
        if (search !== undefined) setCurrentSearch(search);
        if (sort !== undefined) setCurrentSort(sort);
      }
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setError(err.message);
        addToast("Failed to fetch items", "error");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [addToast, currentSearch, currentSort]);

  const createItem = useCallback(async (newItem: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
    try {
      await addItem(newItem);
      addToast("Item added successfully", "success");
      await fetchItems();
    } catch (err: any) {
      addToast("Failed to add item", "error");
      throw err;
    }
  }, [addToast, fetchItems]);

  const editItem = useCallback(async (id: number, updatedData: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
    try {
      await updateItem(id, updatedData);
      addToast("Item updated successfully", "success");
      await fetchItems();
    } catch (err: any) {
      addToast("Failed to update item", "error");
      throw err;
    }
  }, [addToast, fetchItems]);

  const removeItem = useCallback(async (id: number) => {
    // Optimistic: remove from UI immediately
    const previousItems = items;
    setItems(prev => prev.filter(item => item.id !== id));
    try {
      await deleteItem(id);
      addToast("Item deleted successfully", "success");
      await fetchItems(); // Re-sync with server for accurate pagination
    } catch (err: any) {
      // Rollback on failure
      setItems(previousItems);
      addToast("Failed to delete item", "error");
      throw err;
    }
  }, [addToast, fetchItems, items]);

  const bulkRemoveItems = useCallback(async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => deleteItem(id)));
      addToast(`Successfully deleted ${ids.length} items`, "success");
      await fetchItems();
    } catch (err: any) {
      addToast("Some items failed to delete", "error");
      await fetchItems();
      throw err;
    }
  }, [addToast, fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <InventoryContext.Provider value={{ 
      items, totalPages, totalElements, currentPage, loading, error, 
      fetchItems, createItem, editItem, removeItem, bulkRemoveItems 
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
