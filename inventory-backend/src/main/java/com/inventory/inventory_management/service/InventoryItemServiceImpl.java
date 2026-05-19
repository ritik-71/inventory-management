package com.inventory.inventory_management.service;

import com.inventory.inventory_management.dto.InventoryItemDTO;
import com.inventory.inventory_management.entity.InventoryItem;
import com.inventory.inventory_management.exception.ResourceNotFoundException;
import com.inventory.inventory_management.repository.InventoryItemRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class InventoryItemServiceImpl implements InventoryItemService {

    private final InventoryItemRepository repository;
    private final ModelMapper modelMapper;

    public InventoryItemServiceImpl(InventoryItemRepository repository, ModelMapper modelMapper) {
        this.repository = repository;
        this.modelMapper = modelMapper;
    }

    @Override
    public Page<InventoryItemDTO> getAllItems(Pageable pageable) {
        return repository.findAll(pageable)
                .map(item -> modelMapper.map(item, InventoryItemDTO.class));
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
    public Page<InventoryItemDTO> searchItemsByName(String name, Pageable pageable) {
        return repository.findByNameContainingIgnoreCase(name, pageable)
                .map(item -> modelMapper.map(item, InventoryItemDTO.class));
    }
}
