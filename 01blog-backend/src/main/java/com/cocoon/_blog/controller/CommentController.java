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

        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getAllErrors()
                    .stream()
                    .map(err -> err.getDefaultMessage())
                    .reduce((m1, m2) -> m1 + ", " + m2)
                    .orElse("Invalid input");
            return ResponseEntity.badRequest().body(errors);
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Authorization header missing or invalid");
        }

        String token = authHeader.replace("Bearer ", "");
        Long userId = jwtService.extractId(token);
        String username = jwtService.extractUsername(token);

        if (!jwtService.validateToken(token, username)) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }

        commentRequest.setPostId(postId); // assign postId from URL
        return commentService.createComment(commentRequest, userId);
    }

    // Get all comments for a specific post
    @GetMapping("/{postId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long postId) {
        return commentService.getCommentsByPost(postId);
    }
}
