package com.devsecops.orders.dto;

import com.devsecops.orders.model.Order;
import com.devsecops.orders.model.OrderStatus;

import java.time.Instant;

public record MyOrderResponse(
    Long id,
    ProductDto product,
    Integer quantity,
    OrderStatus status,
    Instant createdAt
) {
    public static MyOrderResponse fromEntity(Order order) {
        if (order == null) {
            return null;
        }
        return new MyOrderResponse(
            order.getId(),
            ProductDto.fromEntity(order.getProduct()),
            order.getQuantity(),
            order.getStatus(),
            order.getCreatedAt()
        );
    }
}
