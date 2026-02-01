package com.cocoon._blog.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cocoon._blog.entity.Role;

import javax.crypto.SecretKey;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKeyString;

    private SecretKey key;

    @PostConstruct
    private void init() {
        if (secretKeyString == null || secretKeyString.length() < 32) {
            throw new IllegalStateException(
                "JWT secret is missing or too short. Set jwt.secret or JWT_SECRET_KEY (min 32 chars)."
            );
        }

        this.key = Keys.hmacShaKeyFor(
            secretKeyString.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String username, Long id, Role role, boolean banned) {
        return Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .claim("role", role.toString())
                .claim("banned", banned)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60)) // 1 hour
                .signWith(key)
                .compact();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractId(String token) {
        return extractAllClaims(token).get("id", Long.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token, String username) {
        return extractUsername(token).equals(username) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    public boolean isTokenBanned(String token) {
        return Boolean.TRUE.equals(
                extractAllClaims(token).get("banned", Boolean.class)
        );
    }
}
