package com.inventory.inventory_management;

import com.inventory.inventory_management.entity.*;
import com.inventory.inventory_management.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.math.BigDecimal;

@SpringBootApplication
@EnableScheduling
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
                InventoryItem[] seedItems = {
                    createItem("ThinkPad T14 Gen 4", "Electronics", 15, "1299.00", "950.00", "Lenovo Corp", "SKU-ELEC-001"),
                    createItem("Wireless Noise-Canceling Headphones", "Electronics", 42, "299.99", "150.00", "Sony Audio", "SKU-ELEC-002"),
                    createItem("Ergonomic Mesh Office Chair", "Furniture", 8, "450.00", "220.00", "Herman Miller", "SKU-FURN-001"),
                    createItem("Adjustable Standing Desk 60-inch", "Furniture", 12, "599.00", "300.00", "Uplift Desk", "SKU-FURN-002"),
                    createItem("Commercial Coffee Maker", "Appliances", 3, "1200.00", "800.00", "Breville", "SKU-APPL-001"),
                    createItem("Industrial Grade Storage Rack", "Warehouse", 0, "850.00", "500.00", "U-Line Supply", "SKU-WRHS-001"),
                    createItem("CAT6 Ethernet Cable (1000ft Spool)", "Networking", 25, "125.00", "70.00", "Cisco Systems", "SKU-NET-001"),
                    createItem("Cisco 48-Port Gigabit Switch", "Networking", 4, "1599.00", "1100.00", "Cisco Systems", "SKU-NET-002"),
                    createItem("4K UltraWide Monitor 34-inch", "Electronics", 7, "799.00", "450.00", "LG Electronics", "SKU-ELEC-003"),
                    createItem("Mechanical Keyboard MX Brown", "Electronics", 50, "129.00", "75.00", "KeyChron", "SKU-ELEC-004"),
                    createItem("High-Speed Laser Printer", "Office Supplies", 18, "499.00", "280.00", "HP Enterprise", "SKU-OFFC-001"),
                    createItem("Premium A4 Printer Paper (Case)", "Office Supplies", 150, "45.00", "25.00", "HP Enterprise", "SKU-OFFC-002"),
                };

                for (InventoryItem item : seedItems) {
                    inventoryRepo.save(item);
                }
				System.out.println("Enterprise dummy data inserted successfully.");
			}
		};
	}

    private InventoryItem createItem(String name, String category, int quantity, String sellingPrice, String purchasePrice, String supplier, String sku) {
        InventoryItem item = new InventoryItem();
        item.setName(name);
        item.setCategory(category);
        item.setQuantity(quantity);
        item.setSellingPrice(new BigDecimal(sellingPrice));
        item.setPurchasePrice(new BigDecimal(purchasePrice));
        item.setSupplier(supplier);
        item.setSkuCode(sku);
        item.setUnitType("pcs");
        return item;
    }
}
