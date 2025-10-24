package com.cocoon._blog.controller;

import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.cocoon._blog.dto.PostRequest;
import com.cocoon._blog.entity.NotificationType;
import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.service.FollowService;
import com.cocoon._blog.service.NotificationService;
import com.cocoon._blog.service.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class PostController {

    private final PostService postService;
    private final NotificationService notificationService;
    private final FollowService followService;

    @PostMapping("/create")
    public ResponseEntity<?> createPost(
            @Valid @RequestBody PostRequest request,
            BindingResult bindingResult,
            @AuthenticationPrincipal User currentUser) {

        try {
            if (bindingResult.hasErrors()) {
                String errors = bindingResult.getAllErrors()
                        .stream()
                        .map(err -> err.getDefaultMessage())
                        .reduce((m1, m2) -> m1 + ", " + m2)
                        .orElse("Invalid input");
                return ResponseEntity.badRequest().body(errors);
            }

            HashSet<String> topics = new HashSet<>(List.of("tech", "gaming", "products", "education", "saas"));
            if (!topics.contains(request.getTopic().toLowerCase())) {
                return ResponseEntity.badRequest().body("Invalid topic. Allowed: " + topics);
            }

            // 1️⃣ Create the post
            Post post = postService.createPost(request, currentUser.getId());

            // 2️⃣ Fetch followers of the user
            var followers = followService.getFollowers(currentUser.getId());

            // 3️⃣ Send notifications to followers
            for (Long followerId : followers) {
                notificationService.createNotification(
                        currentUser.getId(),
                        followerId,
                        NotificationType.POST,
                        post.getId(),
                        null,
                        "posted something 📢"
                );
            }

            return ResponseEntity.ok(Map.of("message" , "Post created successfully" ,  "post", post));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating post: " + e.getMessage());
        }
    }

    @PostMapping("/like/{id}")
    public ResponseEntity<?> likePost(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        try {
            var response = postService.likePost(id, currentUser.getId());
            var postOwnerId = postService.getPostOwnerId(id);

            // Send notification only if liker is not the owner
            if (!currentUser.getId().equals(postOwnerId)) {
                notificationService.createNotification(
                        currentUser.getId(),
                        postOwnerId,
                        NotificationType.POST,
                        id,
                        null,
                        "liked your post 🤩"
                );
            }

            return response;
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error liking post: " + e.getMessage());
        }
    }

    @PatchMapping("/edit/{id}")
    public ResponseEntity<?> editPost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request,
            BindingResult bindingResult,
            @AuthenticationPrincipal User currentUser) {
        try {
            if (bindingResult.hasErrors()) {
                String errors = bindingResult.getAllErrors()
                        .stream()
                        .map(err -> err.getDefaultMessage())
                        .reduce((m1, m2) -> m1 + ", " + m2)
                        .orElse("Invalid input");
                return ResponseEntity.badRequest().body(errors);
            }

            HashSet<String> topics = new HashSet<>(List.of("tech", "gaming", "products", "education", "saas"));
            if (!topics.contains(request.getTopic().toLowerCase())) {
                return ResponseEntity.badRequest().body("Invalid topic. Allowed: " + topics);
            }

            Post updatedPost = postService.updatePost(id, request, currentUser.getId());
            return ResponseEntity.ok(postService.buildPostResponse(updatedPost, currentUser.getId()));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error editing post: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        try {
            return postService.deletePost(id, currentUser.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting post: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPosts(@AuthenticationPrincipal User currentUser) {
        try {
            return postService.getAllPosts(currentUser.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching posts: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        try {
            return postService.getPostsById(id, currentUser.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching post: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostByUserId(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        try {
            return postService.getPostByUserId(userId, currentUser.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching posts: " + e.getMessage());
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyPosts(@AuthenticationPrincipal User currentUser) {
        try {
            return postService.getMyPosts(currentUser.getId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching posts: " + e.getMessage());
        }
    }
}
