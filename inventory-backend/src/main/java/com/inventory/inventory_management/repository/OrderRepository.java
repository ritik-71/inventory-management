package com.inventory.inventory_management.repository;

import com.inventory.inventory_management.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
