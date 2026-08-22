package com.devsecops.orders;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JwtAuthenticationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testValidUserToken_Accepted() throws Exception {
        String token = JwtTestUtils.generateUserToken(1L, "valid_user");

        mockMvc.perform(get("/api/orders/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void testValidAdminToken_RecognizedAsAdmin() throws Exception {
        String token = JwtTestUtils.generateAdminToken(2L, "valid_admin");

        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void testInvalidSecretToken_RejectedWith401() throws Exception {
        SecretKey invalidKey = Keys.hmacShaKeyFor("a-completely-different-signing-secret-key-123".getBytes(StandardCharsets.UTF_8));
        String tamperedToken = Jwts.builder()
                .subject("1")
                .claims(Map.of("user_id", 1, "role", "user"))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(invalidKey)
                .compact();

        mockMvc.perform(get("/api/orders/me")
                        .header("Authorization", "Bearer " + tamperedToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Authentication required")));
    }

    @Test
    void testExpiredToken_RejectedWith401() throws Exception {
        SecretKey key = Keys.hmacShaKeyFor(JwtTestUtils.TEST_SECRET.getBytes(StandardCharsets.UTF_8));
        String expiredToken = Jwts.builder()
                .subject("1")
                .claims(Map.of("user_id", 1, "role", "user"))
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 3600000)) // Expired 1 hour ago
                .signWith(key)
                .compact();

        mockMvc.perform(get("/api/orders/me")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Authentication required")));
    }

    @Test
    void testMissingToken_RejectedWith401() throws Exception {
        mockMvc.perform(get("/api/orders/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Authentication required")));
    }
}
