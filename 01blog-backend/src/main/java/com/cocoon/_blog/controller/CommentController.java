package com.cocoon._blog.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.cocoon._blog.dto.CommentRequest;
import com.cocoon._blog.service.CommentService;
import com.cocoon._blog.service.JwtService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/post")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final JwtService jwtService;

    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> createComment(@PathVariable Long postId,
                                           @Valid @RequestBody CommentRequest commentRequest,
                                           BindingResult bindingResult,
                                           @RequestHeader("Authorization") String authHeader) {

        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getAllErrors()
                    .stream()
                    .map(err -> err.getDefaultMessage())
                    .reduce((m1, m2) -> m1 + ", " + m2)
                    .orElse("Invalid input");
            return ResponseEntity.badRequest().body("Validation failed: " + errors);
        }

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid Authorization header");
            }

            String token = authHeader.replace("Bearer ", "").trim();
            
            if (token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Empty token provided");
            }

            Long userId;
            String username;
            
            try {
                userId = jwtService.extractId(token);
                username = jwtService.extractUsername(token);
                
                if (userId == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("Invalid token: user ID not found");
                }
                
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token: " + e.getMessage());
            }

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Token validation failed");
            }

            return commentService.createComment(postId, commentRequest, userId);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error occurred");
        }
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long postId,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid Authorization header");
            }

            String token = authHeader.replace("Bearer ", "").trim();
            
            if (token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Empty token provided");
            }

            Long userId;
            String username;
            
            try {
                userId = jwtService.extractId(token);
                username = jwtService.extractUsername(token);
                
                if (userId == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("Invalid token: user ID not found");
                }
                
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token: " + e.getMessage());
            }

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Token validation failed");
            }

            return commentService.getCommentsByPost(postId, userId);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error occurred");
        }
    }

    @PostMapping("/comment/{commentId}/like")
    public ResponseEntity<?> likeComment(@PathVariable Long commentId,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid Authorization header");
            }

            String token = authHeader.replace("Bearer ", "").trim();
            
            if (token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Empty token provided");
            }

            Long userId;
            String username;
            
            try {
                userId = jwtService.extractId(token);
                username = jwtService.extractUsername(token);
                
                if (userId == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("Invalid token: user ID not found");
                }
                
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired token: " + e.getMessage());
            }

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Token validation failed");
            }

            return commentService.likeComment(commentId, userId);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error occurred");
        }
    }
}