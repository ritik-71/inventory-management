package com.inventory.inventory_management.controller;

import com.inventory.inventory_management.entity.Supplier;
import com.inventory.inventory_management.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierRepository repository;

    @GetMapping
    public List<Supplier> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Supplier create(@RequestBody Supplier entity) {
        return repository.save(entity);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
