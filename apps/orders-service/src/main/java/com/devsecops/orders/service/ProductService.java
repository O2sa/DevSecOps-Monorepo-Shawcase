package com.devsecops.orders.service;

import com.devsecops.orders.common.exception.ResourceNotFoundException;
import com.devsecops.orders.dto.ProductDto;
import com.devsecops.orders.model.Product;
import com.devsecops.orders.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductDto::fromEntity)
                .toList();
    }

    public ProductDto getProductById(Long id) {
        return ProductDto.fromEntity(getProductEntity(id));
    }

    public Product getProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
}
