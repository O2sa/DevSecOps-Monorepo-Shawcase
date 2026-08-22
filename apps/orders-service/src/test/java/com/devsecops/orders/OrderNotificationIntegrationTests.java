package com.devsecops.orders;

import com.devsecops.orders.client.NotificationClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrderNotificationIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @SpyBean
    private NotificationClient notificationClient;

    @Test
    void testCreateOrder_DispatchesNotificationSuccessfully() throws Exception {
        String token = JwtTestUtils.generateUserToken(42L, "notif_user");
        Map<String, Object> payload = Map.of(
                "productId", 1,
                "quantity", 2
        );

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.userId", is(42)));

        // Verify that notificationClient.sendOrderCreatedNotification was called with userId 42
        verify(notificationClient, atLeastOnce()).sendOrderCreatedNotification(eq(42L), anyLong());
    }

    @Test
    void testCreateOrder_WhenNotificationFails_OrderStillSucceeds() throws Exception {
        String token = JwtTestUtils.generateUserToken(99L, "resilient_user");
        Map<String, Object> payload = Map.of(
                "productId", 2,
                "quantity", 1
        );

        // Force notificationClient to simulate an exception
        doThrow(new RuntimeException("Simulated connection timeout to Notification Service"))
                .when(notificationClient).sendOrderCreatedNotification(eq(99L), anyLong());

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.userId", is(99)))
                .andExpect(jsonPath("$.status", is("PENDING")));
    }
}
