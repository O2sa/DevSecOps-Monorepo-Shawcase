package com.devsecops.orders;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

public class JwtTestUtils {

    public static final String TEST_SECRET = "django-insecure-dev-only-secret-key-not-for-production";

    public static String generateToken(Long userId, String username, String email, String role, boolean isAdmin) {
        SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claims(Map.of(
                        "user_id", userId,
                        "username", username,
                        "email", email,
                        "role", role,
                        "is_admin", isAdmin
                ))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    public static String generateUserToken(Long userId, String username) {
        return generateToken(userId, username, username + "@example.com", "user", false);
    }

    public static String generateAdminToken(Long userId, String username) {
        return generateToken(userId, username, username + "@example.com", "admin", true);
    }
}
