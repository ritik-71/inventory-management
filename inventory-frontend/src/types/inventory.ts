export interface InventoryItem {
  id: number;
  name: string;
  skuCode?: string;
  barcode?: string;
  productImage?: string;
  brand?: string;
  unitType?: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  supplier: string;
  supplierEmail?: string;
  warehouseLocation?: string;
  expiryDate?: string;
  dateAdded: string;
  lastUpdated?: string;
  status: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface Supplier {
  id: number;
  supplierName: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  type: string; // 'INCOMING' | 'OUTGOING'
  status: string; // 'PENDING' | 'COMPLETED' | 'CANCELLED'
  totalItems: number;
  createdAt?: string;
}
