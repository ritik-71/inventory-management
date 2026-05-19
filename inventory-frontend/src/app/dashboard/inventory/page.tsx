"use client";

import React, { useState, useMemo } from "react";
import { useInventory } from "../../../context/InventoryContext";
import { FilterBar } from "../../../features/inventory/FilterBar";
import { InventoryTable } from "../../../features/inventory/InventoryTable";
import AddItemModal from "../../../features/inventory/AddItemModal";
import EditItemModal from "../../../features/inventory/EditItemModal";
import DeleteConfirmModal from "../../../features/inventory/DeleteConfirmModal";
import { InventoryItem } from "../../../types/inventory";

export default function InventoryPage() {
  const { items, totalPages, currentPage, fetchItems, createItem, editItem, removeItem, bulkRemoveItems } = useInventory();
  
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

  // Trigger backend fetch when filters change
  React.useEffect(() => {
    fetchItems(filters.search, 0);
  }, [filters.search, fetchItems]);

  return (
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
        items={items} 
        onEdit={(item) => { setSelectedItem(item); setIsEditOpen(true); }}
        onDelete={(item) => { setSelectedItem(item); setIsDeleteOpen(true); }}
        onBulkDelete={bulkRemoveItems}
        currentPage={currentPage + 1} // Context uses 0-indexed Spring Pageable, UI uses 1-indexed
        totalPages={totalPages}
        onPageChange={(page) => fetchItems(filters.search, page - 1)}
        onSortChange={(field, order) => fetchItems(filters.search, currentPage, `${field},${order}`)}
      />

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
}
