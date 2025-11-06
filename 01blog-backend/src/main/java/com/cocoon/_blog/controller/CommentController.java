package com.cocoon._blog.controller;

import com.cocoon._blog.dto.CommentDto;
import com.cocoon._blog.dto.CommentRequest;
import com.cocoon._blog.entity.NotificationType;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.service.CommentService;
import com.cocoon._blog.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/post")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final NotificationService notificationService;

    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest commentRequest,
            BindingResult bindingResult,
            @AuthenticationPrincipal User currentUser) {

        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getAllErrors()
                    .stream()
                    .map(err -> err.getDefaultMessage())
                    .reduce((m1, m2) -> m1 + ", " + m2)
                    .orElse("Invalid input");
            return ResponseEntity.badRequest().body("Validation failed: " + errors);
        }

        try {
            // 1️⃣ Create the comment
            CommentDto commentResponse = commentService.createComment(postId, commentRequest, currentUser.getId());

            // 2️⃣ Get the post owner ID
            Long postOwnerId = commentService.getPostOwnerId(postId);

            // 3️⃣ Send notification only if commenter is not the post owner
            if (!currentUser.getId().equals(postOwnerId)) {
                notificationService.createNotification(
                        currentUser.getId(),
                        postOwnerId,
                        NotificationType.COMMENT,
                        postId,
                        commentResponse.getId(),
                        "💬 commented on your post"
                );
            }

            return ResponseEntity.ok(commentResponse);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<?> getComments(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser) {
        try {
            return commentService.getCommentsByPost(postId, currentUser.getId());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error occurred");
        }
    }

    @PostMapping("/comment/{commentId}/like")
    public ResponseEntity<?> likeComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User currentUser) {
        try {
            return commentService.likeComment(commentId, currentUser.getId());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error occurred");
        }
    }

    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, @AuthenticationPrincipal User currentUser) {
        try {
            return commentService.deleteComment(commentId, currentUser.getId());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error occurred");
        }
    }
}
