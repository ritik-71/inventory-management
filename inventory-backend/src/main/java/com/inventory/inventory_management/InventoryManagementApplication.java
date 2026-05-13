package com.inventory.inventory_management;

import com.inventory.inventory_management.entity.*;
import com.inventory.inventory_management.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.math.BigDecimal;

@SpringBootApplication
public class InventoryManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(InventoryManagementApplication.class, args);
	}

	@Bean
	public CommandLineRunner loadData(InventoryItemRepository inventoryRepo, UserRepository userRepo) {
		return args -> {
            if (userRepo.count() == 0) {
                User admin = new User();
                admin.setEmail("admin1@gmail.com");
                // The password "admin@123" will be encoded in AuthController, but for dummy data we should use encoded password
                // For now, since Spring Security is added, we'll need a BCryptPasswordEncoder. We'll set a raw password and let Auth login handle it or just encode it.
                // Spring security expects bcrypt. admin@123 -> $2a$10$T8P.mE.fPjN8eO0hH5hH8.D8z2K7Z0h2P4P9z2K7Z0h2P4P9z2K7Z
                admin.setPassword("$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG"); // "admin@123"
                admin.setRole("ROLE_ADMIN");
                userRepo.save(admin);
            }

			if (inventoryRepo.count() == 0) {
                InventoryItem item1 = new InventoryItem();
                item1.setName("Wireless Mouse");
                item1.setCategory("Electronics");
                item1.setQuantity(50);
                item1.setSellingPrice(new BigDecimal("29.99"));
                item1.setPurchasePrice(new BigDecimal("15.00"));
                item1.setSupplier("LogiTech Inc.");
                item1.setSkuCode("SKU-ELEC-001");
                item1.setUnitType("pcs");

                InventoryItem item2 = new InventoryItem();
                item2.setName("Mechanical Keyboard");
                item2.setCategory("Electronics");
                item2.setQuantity(5);
                item2.setSellingPrice(new BigDecimal("89.99"));
                item2.setPurchasePrice(new BigDecimal("50.00"));
                item2.setSupplier("KeyChron");
                item2.setSkuCode("SKU-ELEC-002");
                item2.setUnitType("pcs");

                inventoryRepo.save(item1);
                inventoryRepo.save(item2);
				System.out.println("Dummy data inserted.");
			}
		};
	}
}
