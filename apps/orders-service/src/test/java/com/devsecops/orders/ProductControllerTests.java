package com.devsecops.orders;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetAllProducts_ReturnsDemoProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$[0].name", notNullValue()))
                .andExpect(jsonPath("$[0].price", notNullValue()));
    }

    @Test
    void testGetProductById_ReturnsProductDetails() throws Exception {
        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Demo Product A")))
                .andExpect(jsonPath("$.price", is(10.0)));
    }

    @Test
    void testGetProductById_NotFound_Returns404() throws Exception {
        mockMvc.perform(get("/api/products/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Product not found")));
    }
}
