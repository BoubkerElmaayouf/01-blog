package com.cocoon._blog.service;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

// import com.cocoon._blog.dto.RegisterRequest;
import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.User;
// import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.PostRepository;
// import com.cocoon._blog.repository.UserRepository;
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
}
