package com.devsecops.orders.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey signingKey;

    public JwtTokenProvider(@Value("${orders.jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public UserPrincipal getUserPrincipalFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Long userId = null;
        Number userIdNumber = claims.get("user_id", Number.class);
        if (userIdNumber != null) {
            userId = userIdNumber.longValue();
        } else {
            Number fallbackUserId = claims.get("userId", Number.class);
            if (fallbackUserId != null) {
                userId = fallbackUserId.longValue();
            } else if (claims.getSubject() != null) {
                try {
                    userId = Long.parseLong(claims.getSubject());
                } catch (NumberFormatException ignored) {
                }
            }
        }

        String username = claims.get("username", String.class);
        if (username == null) {
            username = claims.getSubject();
        }

        String email = claims.get("email", String.class);
        String role = claims.get("role", String.class);
        Boolean isAdminObj = claims.get("is_admin", Boolean.class);
        boolean isAdmin = Boolean.TRUE.equals(isAdminObj) || "admin".equalsIgnoreCase(role);

        return UserPrincipal.create(userId, username, email, role != null ? role : "user", isAdmin);
    }
}
