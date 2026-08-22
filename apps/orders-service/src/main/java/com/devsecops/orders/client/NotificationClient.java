package com.devsecops.orders.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Component
public class NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClient.class);

    private final RestTemplate restTemplate;
    private final String notificationServiceUrl;

    public NotificationClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${notification.service.url:http://localhost:8003}") String notificationServiceUrl
    ) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(3))
                .setReadTimeout(Duration.ofSeconds(3))
                .build();
        this.notificationServiceUrl = notificationServiceUrl;
    }

    public void sendOrderCreatedNotification(Long userId, Long orderId) {
        String url = notificationServiceUrl.replaceAll("/+$", "") + "/internal/notifications";

        NotificationRequest payload = new NotificationRequest(
                userId,
                "ORDER_CREATED",
                "Order created",
                "Your order #" + orderId + " has been created successfully."
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<NotificationRequest> request = new HttpEntity<>(payload, headers);

        try {
            log.info("Sending order created notification to {} for order #{}", url, orderId);
            restTemplate.postForEntity(url, request, Void.class);
            log.info("Successfully dispatched notification for order #{}", orderId);
        } catch (Exception ex) {
            log.warn("Could not dispatch notification for order #{} to Notification Service ({}): {}. Order creation proceeds normally.",
                    orderId, url, ex.getMessage());
        }
    }
}
