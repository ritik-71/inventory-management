package com.inventory.inventory_management.repository;

import com.inventory.inventory_management.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByNameContainingIgnoreCase(String name);
}
