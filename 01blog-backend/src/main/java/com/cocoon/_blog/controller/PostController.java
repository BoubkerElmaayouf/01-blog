package com.cocoon._blog.controller;

import java.util.HashSet;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.cocoon._blog.dto.PostRequest;
import com.cocoon._blog.service.JwtService;
import com.cocoon._blog.service.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class PostController {

    private final PostService postService;
    private final JwtService jwtService;

    @PostMapping("/create")
    public ResponseEntity<?> createPost(@Valid @RequestBody PostRequest request,
                                        BindingResult bindingResult,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            if (bindingResult.hasErrors()) {
                String errors = bindingResult.getAllErrors()
                    .stream()
                    .map(err -> err.getDefaultMessage())
                    .reduce((m1, m2) -> m1 + ", " + m2)
                    .orElse("Invalid input");
                return ResponseEntity.badRequest().body(errors);
            }

            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractId(token);
            String username = jwtService.extractUsername(token);

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.badRequest().body("Invalid or expired token");
            }

            HashSet<String> topics = new HashSet<>(List.of("tech", "gaming", "products", "education", "saas"));
            if (!topics.contains(request.getTopic().toLowerCase())) {
                return ResponseEntity.badRequest().body("Invalid topic. Allowed: " + topics);
            }

            return postService.createPost(request, userId);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid token or request: " + e.getMessage());
        }
    }

    @PostMapping("/like/{id}")
    public ResponseEntity<?> likePost(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractId(token);
            String username = jwtService.extractUsername(token);

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.badRequest().body("Invalid or expired token");
            }

            return postService.likePost(id, userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid token or request: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPosts(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractId(token);
            return postService.getAllPosts(userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching posts: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractId(token);
            return postService.getPostsById(id, userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching post: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostByUserId(@PathVariable Long userId,
                                             @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long currentUserId = jwtService.extractId(token);
            return postService.getPostByUserId(userId, currentUserId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching posts: " + e.getMessage());
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyPosts(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractId(token);
            return postService.getMyPosts(userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching posts: " + e.getMessage());
        }
    }

}
