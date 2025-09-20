package com.cocoon._blog.controller;

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

    // Create comment for a specific post
    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest commentRequest,
            BindingResult bindingResult,
            @RequestHeader("Authorization") String authHeader) {

        // Validate input
        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getAllErrors()
                    .stream()
                    .map(err -> err.getDefaultMessage())
                    .reduce((m1, m2) -> m1 + ", " + m2)
                    .orElse("Invalid input");
            return ResponseEntity.badRequest().body(errors);
        }

        // Validate authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Authorization header missing or invalid");
        }

        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractId(token);
            String username = jwtService.extractUsername(token);

            // Validate token
            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.status(401).body("Invalid or expired token");
            }

            // Set postId from URL parameter
            commentRequest.setPostId(postId);
            
            return commentService.createComment(commentRequest, userId);
            
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/comment/{commentId}/like")
    public ResponseEntity<?> likeComment(@PathVariable Long commentId,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractId(token);
            String username = jwtService.extractUsername(token);

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.badRequest().body("Invalid or expired token");
            }

            return commentService.likeComment(commentId, userId);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error liking comment: " + e.getMessage());
        }
    }

    // Get all comments for a specific post
    @GetMapping("/{postId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long postId) {
        try {
            return commentService.getCommentsByPost(postId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching comments: " + e.getMessage());
        }
    }
}