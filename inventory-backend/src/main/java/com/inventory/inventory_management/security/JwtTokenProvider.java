package com.inventory.inventory_management.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt-secret:${JWT_SECRET:}}")
    private String jwtSecretString;

    private Key key;

    // 15 minutes for access token, 7 days for refresh token
    private final long accessExpirationInMs = 900000;
    private final long refreshExpirationInMs = 604800000;

    @PostConstruct
    public void init() {
        if (jwtSecretString == null || jwtSecretString.trim().isEmpty()) {
            System.err.println(
                    "WARNING: JWT_SECRET environment variable is missing! Generating a dynamic ephemeral key. User sessions will NOT persist across restarts.");
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        } else {
            if (jwtSecretString.length() < 32) {
                System.err.println(
                        "WARNING: JWT_SECRET is too short (must be at least 32 characters / 256-bits). Generating an ephemeral key instead for safety.");
                this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            } else {
                this.key = Keys.hmacShaKeyFor(jwtSecretString.getBytes(StandardCharsets.UTF_8));
            }
        }
    }

    public String generateToken(Authentication authentication) {
        return generateAccessToken(authentication.getName());
    }

    public String generateAccessToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessExpirationInMs);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpirationInMs);

        return Jwts.builder()
                .setSubject(email)
                .setId(java.util.UUID.randomUUID().toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getEmailFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            System.err.println("Invalid JWT token: " + ex.getMessage());
        }
        return false;
    }
}
