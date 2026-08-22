package com.devsecops.orders;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminOrderControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetAllOrders_RegularUser_Returns403() throws Exception {
        String userToken = JwtTestUtils.generateUserToken(1L, "regularuser");

        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("You do not have permission to perform this action")));
    }

    @Test
    void testGetAllOrders_AdminUser_Returns200() throws Exception {
        String adminToken = JwtTestUtils.generateAdminToken(999L, "adminuser");

        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void testUpdateOrderStatus_RegularUser_Returns403() throws Exception {
        String userToken = JwtTestUtils.generateUserToken(1L, "regularuser");

        mockMvc.perform(patch("/api/orders/1/status")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "PROCESSING"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", is("You do not have permission to perform this action")));
    }

    @Test
    void testUpdateOrderStatus_AdminUser_Success() throws Exception {
        String userToken = JwtTestUtils.generateUserToken(50L, "buyer");
        String adminToken = JwtTestUtils.generateAdminToken(999L, "adminuser");

        // 1. Create an order as buyer
        String createResponse = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("productId", 1, "quantity", 1))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Map<?, ?> orderMap = objectMapper.readValue(createResponse, Map.class);
        Number orderId = (Number) orderMap.get("id");

        // 2. Update status as admin
        mockMvc.perform(patch("/api/orders/" + orderId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "PROCESSING"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(orderId.intValue())))
                .andExpect(jsonPath("$.status", is("PROCESSING")));

        // 3. Update status to COMPLETED
        mockMvc.perform(patch("/api/orders/" + orderId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "COMPLETED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")));
    }

    @Test
    void testUpdateOrderStatus_NonexistentOrder_Returns404() throws Exception {
        String adminToken = JwtTestUtils.generateAdminToken(999L, "adminuser");

        mockMvc.perform(patch("/api/orders/99999/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "PROCESSING"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Order not found")));
    }
}
