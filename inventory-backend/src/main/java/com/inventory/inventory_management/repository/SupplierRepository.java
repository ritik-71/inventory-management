package com.inventory.inventory_management.repository;

import com.inventory.inventory_management.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}
