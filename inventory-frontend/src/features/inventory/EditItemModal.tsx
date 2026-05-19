import React, { useState, useEffect } from "react";
import { InventoryItem } from "../../types/inventory";
import "../../styles/modal.css";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: number, item: Omit<InventoryItem, 'id' | 'dateAdded'>) => void;
  item: InventoryItem | null;
}

export default function EditItemModal({ isOpen, onClose, onEdit, item }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    skuCode: "",
    brand: "",
    category: "Electronics",
    quantity: 0,
    unitType: "pcs",
    purchasePrice: 0,
    sellingPrice: 0,
    supplier: "",
    supplierEmail: "",
    warehouseLocation: "",
    status: "IN_STOCK"
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        skuCode: item.skuCode || "",
        brand: item.brand || "",
        category: item.category,
        quantity: item.quantity,
        unitType: item.unitType || "pcs",
        purchasePrice: item.purchasePrice || 0,
        sellingPrice: item.sellingPrice || 0,
        supplier: item.supplier,
        supplierEmail: item.supplierEmail || "",
        warehouseLocation: item.warehouseLocation || "",
        status: item.status
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      onEdit(item.id, formData as unknown as Omit<InventoryItem, 'id' | 'dateAdded'>);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Edit Inventory Item</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Item Name</label>
              <input required type="text" className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="label">SKU Code</label>
              <input required type="text" className="input" value={formData.skuCode} onChange={e => setFormData({...formData, skuCode: e.target.value})} />
            </div>
            <div>
              <label className="label">Brand</label>
              <input type="text" className="input" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Software">Software</option>
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input required type="number" min="0" className="input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="label">Unit Type</label>
              <input type="text" className="input" value={formData.unitType} onChange={e => setFormData({...formData, unitType: e.target.value})} />
            </div>
            <div>
              <label className="label">Purchase Price ($)</label>
              <input required type="number" min="0" step="0.01" className="input" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})} />
            </div>
            <div>
              <label className="label">Selling Price ($)</label>
              <input required type="number" min="0" step="0.01" className="input" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})} />
            </div>
            <div>
              <label className="label">Supplier Name</label>
              <input required type="text" className="input" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
            </div>
            <div>
              <label className="label">Supplier Email</label>
              <input type="email" className="input" value={formData.supplierEmail} onChange={e => setFormData({...formData, supplierEmail: e.target.value})} />
            </div>
            <div>
              <label className="label">Warehouse Location</label>
              <input type="text" className="input" value={formData.warehouseLocation} onChange={e => setFormData({...formData, warehouseLocation: e.target.value})} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>
          
          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
