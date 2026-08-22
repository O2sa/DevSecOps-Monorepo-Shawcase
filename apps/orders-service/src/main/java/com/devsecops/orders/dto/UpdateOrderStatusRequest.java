package com.devsecops.orders.dto;

import com.devsecops.orders.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
    @NotNull(message = "status is required")
    OrderStatus status
) {
}
