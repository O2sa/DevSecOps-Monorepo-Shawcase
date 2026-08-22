package com.devsecops.orders.service;

import com.devsecops.orders.common.exception.ResourceNotFoundException;
import com.devsecops.orders.dto.CreateOrderRequest;
import com.devsecops.orders.dto.MyOrderResponse;
import com.devsecops.orders.dto.OrderResponse;
import com.devsecops.orders.dto.UpdateOrderStatusRequest;
import com.devsecops.orders.model.Order;
import com.devsecops.orders.model.OrderStatus;
import com.devsecops.orders.model.Product;
import com.devsecops.orders.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;

    public OrderService(OrderRepository orderRepository, ProductService productService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
    }

    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        Product product = productService.getProductEntity(request.productId());

        Order order = new Order(
                userId,
                product,
                request.quantity(),
                OrderStatus.PENDING
        );

        Order savedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<MyOrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByIdAsc(userId)
                .stream()
                .map(MyOrderResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByIdAsc()
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(request.status());
        Order updatedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(updatedOrder);
    }
}
