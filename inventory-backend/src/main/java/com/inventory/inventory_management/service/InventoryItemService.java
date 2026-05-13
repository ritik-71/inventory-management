package com.inventory.inventory_management.service;

import com.inventory.inventory_management.dto.InventoryItemDTO;

import java.util.List;

public interface InventoryItemService {
    List<InventoryItemDTO> getAllItems();
    InventoryItemDTO getItemById(Long id);
    InventoryItemDTO createItem(InventoryItemDTO itemDTO);
    InventoryItemDTO updateItem(Long id, InventoryItemDTO itemDTO);
    void deleteItem(Long id);
    List<InventoryItemDTO> searchItemsByName(String name);
}
