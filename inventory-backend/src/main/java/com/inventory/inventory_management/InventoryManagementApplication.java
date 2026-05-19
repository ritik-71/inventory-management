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
        String profile = System.getenv("SPRING_PROFILES_ACTIVE");
        if ("prod".equals(profile) || "production".equals(profile)) {
            if (System.getenv("JWT_SECRET") == null || System.getenv("JWT_SECRET").length() < 32) {
                System.err.println("FATAL: JWT_SECRET environment variable is missing or insufficiently secure (<32 chars) for production.");
                System.exit(1);
            }
            if (System.getenv("SPRING_DATASOURCE_URL") == null) {
                System.err.println("FATAL: SPRING_DATASOURCE_URL is missing. Database connection cannot be established.");
                System.exit(1);
            }
        }
		SpringApplication.run(InventoryManagementApplication.class, args);
	}

	@Bean
	public CommandLineRunner loadData(InventoryItemRepository inventoryRepo, UserRepository userRepo, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
		return args -> {
            if (userRepo.count() == 0) {
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin1@gmail.com");
                admin.setPassword(passwordEncoder.encode("admin@123"));
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
