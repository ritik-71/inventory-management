package com.inventory.inventory_management.controller;

import com.inventory.inventory_management.dto.InventoryItemDTO;
import com.inventory.inventory_management.service.InventoryItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class InventoryItemController {

    private final InventoryItemService service;

    @GetMapping
    public ResponseEntity<List<InventoryItemDTO>> getAllItems(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(service.searchItemsByName(search));
        }
        return ResponseEntity.ok(service.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getItemById(id));
    }

    @PostMapping
    public ResponseEntity<InventoryItemDTO> createItem(@RequestBody InventoryItemDTO itemDTO) {
        return new ResponseEntity<>(service.createItem(itemDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> updateItem(@PathVariable Long id, @RequestBody InventoryItemDTO itemDTO) {
        return ResponseEntity.ok(service.updateItem(id, itemDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        service.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
