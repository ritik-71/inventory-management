package com.inventory.inventory_management.repository;

import com.inventory.inventory_management.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
