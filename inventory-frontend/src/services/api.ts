import { InventoryItem } from '../types/inventory';
import { apiClient } from '../utils/apiClient';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/api/items';

export const getItems = async (search?: string): Promise<InventoryItem[]> => {
  const queryParam = search ? `search=${encodeURIComponent(search)}&size=1000` : `size=1000`;
  const url = `${API_BASE_URL}?${queryParam}`;
  const response: any = await apiClient<any>(url);
  return response.content || response;
};

export const addItem = (item: Omit<InventoryItem, 'id' | 'dateAdded'>): Promise<InventoryItem> => {
  return apiClient<InventoryItem>(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(item),
  });
};

export const updateItem = (id: number, item: Omit<InventoryItem, 'id' | 'dateAdded'>): Promise<InventoryItem> => {
  return apiClient<InventoryItem>(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
};

export const deleteItem = (id: number): Promise<void> => {
  return apiClient<void>(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
};
