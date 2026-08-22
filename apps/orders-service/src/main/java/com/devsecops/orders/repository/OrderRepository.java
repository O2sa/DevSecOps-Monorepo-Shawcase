package com.devsecops.orders.repository;

import com.devsecops.orders.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByIdAsc(Long userId);
    List<Order> findAllByOrderByIdAsc();
}
