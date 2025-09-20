package com.cocoon._blog.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import com.cocoon._blog.dto.PostRequest;
import com.cocoon._blog.dto.PostResponse;
import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.PostReaction;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.CommentRepository;
import com.cocoon._blog.repository.PostReactionRepository;
import com.cocoon._blog.repository.PostRepository;
import com.cocoon._blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostReactionRepository postReactionRepository;
    private final CommentRepository commentRepository;


    public ResponseEntity<?> createPost(PostRequest request, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
            .title(request.getTitle())
            .topic(request.getTopic())
            .banner(request.getBanner())
            .description(request.getDescription())
            .videos(request.getVideos())
            .user(user)
            .createdAt(LocalDateTime.now())
            .build();

        postRepository.save(post);
        return ResponseEntity.ok(post);
    }

    // Get all posts
    public ResponseEntity<?> getAllPosts() {
        List<PostResponse> posts = postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
            .map(post -> new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getTopic(),
                post.getBanner(),
                post.getDescription(),
                post.getVideos(),
                post.getCreatedAt(),
                post.getUser().getFirstName(),
                post.getUser().getLastName(),
                post.getUser().getProfilePic(),
                (int) postReactionRepository.countByPost(post),   // likeCount
                (int) commentRepository.countByPost(post)        // commentCount
            )).collect(Collectors.toList());

        return ResponseEntity.ok(posts);
    }

    // Get post by ID
    public ResponseEntity<?> getPostsById(long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

        PostResponse response = new PostResponse(
            post.getId(),
            post.getTitle(),
            post.getTopic(),
            post.getBanner(),
            post.getDescription(),
            post.getVideos(),
            post.getCreatedAt(),
            post.getUser().getFirstName(),
            post.getUser().getLastName(),
            post.getUser().getProfilePic(),
            (int) postReactionRepository.countByPost(post),
            (int) commentRepository.countByPost(post)
        );
        
        return ResponseEntity.ok(response);
    }

    // Get posts by User ID
    public ResponseEntity<?> getPostByUserId(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<PostResponse> posts = postRepository.findByUser(user).stream()
            .map(post -> new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getTopic(),
                post.getBanner(),
                post.getDescription(),
                post.getVideos(),
                post.getCreatedAt(),
                post.getUser().getFirstName(),
                post.getUser().getLastName(),
                post.getUser().getProfilePic(),
                (int) postReactionRepository.countByPost(post),   // likeCount
                (int) commentRepository.countByPost(post)        // commentCount
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(posts);
    }

    // Get posts of current logged-in user (using userId from JWT)
    public ResponseEntity<?> getMyPosts(Long userId) {
        return getPostByUserId(userId); // reuse the same logic
    }

    // post reaction
    public ResponseEntity<?> likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if reaction already exists
        return postReactionRepository.findByUserAndPost(user, post)
            .map(existingReaction -> {
                // Already liked → remove it
                postReactionRepository.delete(existingReaction);
                return ResponseEntity.ok("Like removed");
            })
            .orElseGet(() -> {
                // Not liked → add it
                PostReaction reaction = PostReaction.builder()
                    .user(user)
                    .post(post)
                    .createdAt(LocalDateTime.now())
                    .build();
                postReactionRepository.save(reaction);
                return ResponseEntity.ok("Like added");
            });
    }
}
