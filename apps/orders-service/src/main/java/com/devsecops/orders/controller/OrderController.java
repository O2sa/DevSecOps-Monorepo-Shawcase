package com.devsecops.orders.controller;

import com.devsecops.orders.dto.CreateOrderRequest;
import com.devsecops.orders.dto.MyOrderResponse;
import com.devsecops.orders.dto.OrderResponse;
import com.devsecops.orders.dto.UpdateOrderStatusRequest;
import com.devsecops.orders.security.UserPrincipal;
import com.devsecops.orders.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        OrderResponse response = orderService.createOrder(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<MyOrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<MyOrderResponse> myOrders = orderService.getUserOrders(principal.getUserId());
        return ResponseEntity.ok(myOrders);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderResponse response = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
