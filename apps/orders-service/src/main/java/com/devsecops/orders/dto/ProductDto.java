package com.devsecops.orders.dto;

import com.devsecops.orders.model.Product;
import java.math.BigDecimal;

public record ProductDto(
    Long id,
    String name,
    BigDecimal price
) {
    public static ProductDto fromEntity(Product product) {
        if (product == null) {
            return null;
        }
        return new ProductDto(
            product.getId(),
            product.getName(),
            product.getPrice()
        );
    }
}
