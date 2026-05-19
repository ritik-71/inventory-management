package com.inventory.inventory_management.service;

import com.inventory.inventory_management.dto.InventoryItemDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InventoryItemService {
    Page<InventoryItemDTO> getAllItems(Pageable pageable);
    InventoryItemDTO getItemById(Long id);
    InventoryItemDTO createItem(InventoryItemDTO itemDTO);
    InventoryItemDTO updateItem(Long id, InventoryItemDTO itemDTO);
    void deleteItem(Long id);
    Page<InventoryItemDTO> searchItemsByName(String name, Pageable pageable);
}
