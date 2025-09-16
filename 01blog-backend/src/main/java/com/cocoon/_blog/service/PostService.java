package com.cocoon._blog.service;

import java.time.LocalDateTime;

// import org.hibernate.mapping.List;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.cocoon._blog.dto.PostResponse;
import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.PostRepository;
import com.cocoon._blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public ResponseEntity<?> createPost(Post request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .user(user) // set the author
                .title(request.getTitle())
                .topic(request.getTopic())
                .banner(request.getBanner())
                .description(request.getDescription())
                .videos(request.getVideos())
                .createdAt(LocalDateTime.now())
                .build();

        postRepository.save(post);
        return ResponseEntity.ok(post);
    }

    public ResponseEntity<?> getAllPosts() {
        List<PostResponse> posts = postRepository.findAll().stream()
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
                post.getUser().getProfilePic()
            ))
            .collect(Collectors.toList());

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
            post.getUser().getProfilePic()
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
                post.getUser().getProfilePic()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(posts);
    }

    // Get posts of current logged-in user (using userId from JWT)
    public ResponseEntity<?> getMyPosts(Long userId) {
        return getPostByUserId(userId); // reuse the same logic
    }
}
