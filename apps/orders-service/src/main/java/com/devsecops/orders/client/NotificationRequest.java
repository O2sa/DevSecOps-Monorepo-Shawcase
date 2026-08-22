package com.devsecops.orders.client;

public record NotificationRequest(
    Long userId,
    String type,
    String title,
    String message
) {
}
