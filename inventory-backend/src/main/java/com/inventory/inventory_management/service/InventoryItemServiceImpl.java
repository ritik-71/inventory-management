package com.inventory.inventory_management.service;

import com.inventory.inventory_management.dto.InventoryItemDTO;
import com.inventory.inventory_management.entity.InventoryItem;
import com.inventory.inventory_management.exception.ResourceNotFoundException;
import com.inventory.inventory_management.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryItemServiceImpl implements InventoryItemService {

    private final InventoryItemRepository repository;
    private final ModelMapper modelMapper;

    @Override
    public List<InventoryItemDTO> getAllItems() {
        return repository.findAll().stream()
                .map(item -> modelMapper.map(item, InventoryItemDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public InventoryItemDTO getItemById(Long id) {
        InventoryItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return modelMapper.map(item, InventoryItemDTO.class);
    }

    @Override
    public InventoryItemDTO createItem(InventoryItemDTO itemDTO) {
        InventoryItem item = modelMapper.map(itemDTO, InventoryItem.class);
        item.setId(null); // Ensure a new item is created
        InventoryItem savedItem = repository.save(item);
        return modelMapper.map(savedItem, InventoryItemDTO.class);
    }

    @Override
    public InventoryItemDTO updateItem(Long id, InventoryItemDTO itemDTO) {
        InventoryItem existingItem = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        
        existingItem.setName(itemDTO.getName());
        existingItem.setSkuCode(itemDTO.getSkuCode());
        existingItem.setBarcode(itemDTO.getBarcode());
        existingItem.setProductImage(itemDTO.getProductImage());
        existingItem.setBrand(itemDTO.getBrand());
        existingItem.setUnitType(itemDTO.getUnitType());
        existingItem.setCategory(itemDTO.getCategory());
        existingItem.setQuantity(itemDTO.getQuantity());
        existingItem.setPurchasePrice(itemDTO.getPurchasePrice());
        existingItem.setSellingPrice(itemDTO.getSellingPrice());
        existingItem.setSupplier(itemDTO.getSupplier());
        existingItem.setSupplierEmail(itemDTO.getSupplierEmail());
        existingItem.setWarehouseLocation(itemDTO.getWarehouseLocation());
        existingItem.setExpiryDate(itemDTO.getExpiryDate());
        
        InventoryItem updatedItem = repository.save(existingItem);
        return modelMapper.map(updatedItem, InventoryItemDTO.class);
    }

    @Override
    public void deleteItem(Long id) {
        InventoryItem existingItem = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        repository.delete(existingItem);
    }

    @Override
    public List<InventoryItemDTO> searchItemsByName(String name) {
        return repository.findByNameContainingIgnoreCase(name).stream()
                .map(item -> modelMapper.map(item, InventoryItemDTO.class))
                .collect(Collectors.toList());
    }
}
