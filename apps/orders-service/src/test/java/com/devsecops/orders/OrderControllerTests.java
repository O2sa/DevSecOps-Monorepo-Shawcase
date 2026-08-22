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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateOrder_WithValidJwt_Success() throws Exception {
        String token = JwtTestUtils.generateUserToken(10L, "alice");
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
                .andExpect(jsonPath("$.userId", is(10)))
                .andExpect(jsonPath("$.product.id", is(1)))
                .andExpect(jsonPath("$.quantity", is(2)))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.createdAt", notNullValue()));
    }

    @Test
    void testCreateOrder_WithoutAuthentication_Returns401() throws Exception {
        Map<String, Object> payload = Map.of(
                "productId", 1,
                "quantity", 2
        );

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Authentication required")));
    }

    @Test
    void testCreateOrder_WithNonexistentProduct_Returns404() throws Exception {
        String token = JwtTestUtils.generateUserToken(10L, "alice");
        Map<String, Object> payload = Map.of(
                "productId", 9999,
                "quantity", 1
        );

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Product not found")));
    }

    @Test
    void testCreateOrder_WithInvalidQuantity_Returns400() throws Exception {
        String token = JwtTestUtils.generateUserToken(10L, "alice");
        Map<String, Object> payload = Map.of(
                "productId", 1,
                "quantity", 0
        );

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.quantity", notNullValue()));
    }

    @Test
    void testGetMyOrders_ReturnsOnlyAuthenticatedUserOrders() throws Exception {
        String aliceToken = JwtTestUtils.generateUserToken(100L, "alice_unique");
        String bobToken = JwtTestUtils.generateUserToken(200L, "bob_unique");

        // Alice creates 2 orders
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("productId", 1, "quantity", 1))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("productId", 2, "quantity", 3))))
                .andExpect(status().isCreated());

        // Bob creates 1 order
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("productId", 3, "quantity", 1))))
                .andExpect(status().isCreated());

        // Alice fetches /api/orders/me
        mockMvc.perform(get("/api/orders/me")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].product.name", is("Demo Product A")))
                .andExpect(jsonPath("$[1].product.name", is("Demo Product B")));

        // Bob fetches /api/orders/me
        mockMvc.perform(get("/api/orders/me")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].product.name", is("Demo Product C")));
    }
}
