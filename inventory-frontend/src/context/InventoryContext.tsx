"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { InventoryItem } from '../types/inventory';
import { getItems, addItem, updateItem, deleteItem } from '../services/api';
import { useToast } from './ToastContext';

interface InventoryContextType {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  fetchItems: (search?: string) => Promise<void>;
  createItem: (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => Promise<void>;
  editItem: (id: number, item: Omit<InventoryItem, 'id' | 'dateAdded'>) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  bulkRemoveItems: (ids: number[]) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchItems = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItems(search);
      setItems(data);
    } catch (err: any) {
      setError(err.message);
      addToast("Failed to fetch items", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

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
    try {
      await deleteItem(id);
      addToast("Item deleted successfully", "success");
      await fetchItems();
    } catch (err: any) {
      addToast("Failed to delete item", "error");
      throw err;
    }
  }, [addToast, fetchItems]);

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
    <InventoryContext.Provider value={{ items, loading, error, fetchItems, createItem, editItem, removeItem, bulkRemoveItems }}>
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
