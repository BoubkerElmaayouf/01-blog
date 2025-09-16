package com.cocoon._blog.controller;

import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.cocoon._blog.entity.Post;
import com.cocoon._blog.service.JwtService;
import com.cocoon._blog.service.PostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class PostController {

    private final PostService postService;
    private final JwtService jwtService;

    @PostMapping("/create")
    public ResponseEntity<?> createPost(@RequestBody Post request, 
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from header
            String token = authHeader.replace("Bearer ", "");

            // Extract userId from JWT
            Long userId = jwtService.extractId(token);

            // Validate token
            String username = jwtService.extractUsername(token);
            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.badRequest().body("Invalid or expired token");
            }

            // Create post
            return postService.createPost(request, userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid token or request: " + e.getMessage());
        }
    }
}