import { InventoryItem } from '../types/inventory';
import { apiClient } from '../utils/apiClient';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + '/api/items';

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const getItems = async (search?: string, page: number = 0, size: number = 10, sort: string = 'id,desc'): Promise<PageResponse<InventoryItem>> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort
  });
  if (search) queryParams.append('search', search);

  const url = `${API_BASE_URL}?${queryParams.toString()}`;
  const response: any = await apiClient<any>(url);
  
  if (response.content) {
    return response as PageResponse<InventoryItem>;
  }
  
  // Fallback if backend doesn't return page structure
  return {
    content: response,
    totalPages: 1,
    totalElements: response.length,
    size: response.length,
    number: 0
  };
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
