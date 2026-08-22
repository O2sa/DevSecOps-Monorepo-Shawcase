package com.devsecops.orders.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
    @NotNull(message = "productId is required")
    Long productId,

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be greater than zero")
    Integer quantity
) {
}
