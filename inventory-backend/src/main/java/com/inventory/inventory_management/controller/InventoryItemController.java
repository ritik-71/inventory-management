package com.inventory.inventory_management.controller;

import com.inventory.inventory_management.dto.InventoryItemDTO;
import com.inventory.inventory_management.service.InventoryItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/items")
public class InventoryItemController {

    private final InventoryItemService service;

    public InventoryItemController(InventoryItemService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<InventoryItemDTO>> getAllItems(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(service.searchItemsByName(search, pageable));
        }
        return ResponseEntity.ok(service.getAllItems(pageable));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getInventoryAnalytics() {
        // Since we are now using pagination, global KPIs must be aggregated server-side
        List<InventoryItemDTO> allItems = service.getAllItems(Pageable.unpaged()).getContent();
        
        long totalItems = allItems.size();
        BigDecimal inventoryValue = BigDecimal.ZERO;
        long lowStock = 0;
        long outOfStock = 0;
        Map<String, Long> categoryInsights = new HashMap<>();

        for (InventoryItemDTO item : allItems) {
            if (item.getSellingPrice() != null && item.getQuantity() != null) {
                inventoryValue = inventoryValue.add(item.getSellingPrice().multiply(new BigDecimal(item.getQuantity())));
            }
            if (item.getQuantity() != null) {
                if (item.getQuantity() > 0 && item.getQuantity() < 10) lowStock++;
                if (item.getQuantity() == 0) outOfStock++;
            }
            if (item.getCategory() != null) {
                categoryInsights.put(item.getCategory(), categoryInsights.getOrDefault(item.getCategory(), 0L) + 1L);
            }
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalItems", totalItems);
        analytics.put("inventoryValue", inventoryValue);
        analytics.put("lowStock", lowStock);
        analytics.put("outOfStock", outOfStock);
        analytics.put("categoryInsights", categoryInsights);

        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getItemById(id));
    }

    @PostMapping
    public ResponseEntity<InventoryItemDTO> createItem(@Valid @RequestBody InventoryItemDTO itemDTO) {
        return new ResponseEntity<>(service.createItem(itemDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> updateItem(@PathVariable Long id, @Valid @RequestBody InventoryItemDTO itemDTO) {
        return ResponseEntity.ok(service.updateItem(id, itemDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        service.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
