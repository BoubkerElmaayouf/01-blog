package com.cocoon._blog.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import com.cocoon._blog.entity.Role;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256); // secure key

    public String generateToken(String username, Long id, Role role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .claim("role", role.toString()) // or role.toString() if enum
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour
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
        return extractAllClaims(token).getSubject(); // subject = username
    }

    public Long extractId(String token) {
        return extractAllClaims(token).get("id", Long.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }


}
