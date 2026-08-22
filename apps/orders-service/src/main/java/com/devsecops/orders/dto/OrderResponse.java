package com.devsecops.orders.dto;

import com.devsecops.orders.model.Order;
import com.devsecops.orders.model.OrderStatus;

import java.time.Instant;

public record OrderResponse(
    Long id,
    Long userId,
    ProductDto product,
    Integer quantity,
    OrderStatus status,
    Instant createdAt
) {
    public static OrderResponse fromEntity(Order order) {
        if (order == null) {
            return null;
        }
        return new OrderResponse(
            order.getId(),
            order.getUserId(),
            ProductDto.fromEntity(order.getProduct()),
            order.getQuantity(),
            order.getStatus(),
            order.getCreatedAt()
        );
    }
}
