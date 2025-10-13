package com.cocoon._blog.config;

import com.cocoon._blog.repository.UserRepository;
import com.cocoon._blog.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // No header → continue without authentication
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String token = authHeader.substring(7);
            final String username = jwtService.extractUsername(token);

            // If already authenticated, skip
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var user = userRepository.findByEmail(username).orElse(null);

                if (user != null && jwtService.validateToken(token, username)) {
                    var authToken = new UsernamePasswordAuthenticationToken(
                            new User(user.getEmail(), user.getPassword(),
                                    Collections.singleton(() -> "ROLE_" + user.getRole().name())),
                            null,
                            Collections.singleton(() -> "ROLE_" + user.getRole().name())
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ex) {
            // optional: log or ignore token errors
            System.out.println("JWT Filter error: " + ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
