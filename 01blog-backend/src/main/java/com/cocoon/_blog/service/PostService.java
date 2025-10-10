package com.cocoon._blog.service;

import java.net.ResponseCache;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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

    // Build PostResponse with isLiked
    private PostResponse buildPostResponse(Post post, Long currentUserId) {
        int likeCount = (int) postReactionRepository.countByPost(post);
        int commentCount = (int) commentRepository.countByPost(post);

        boolean isLiked = false;
        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            isLiked = postReactionRepository.findByUserAndPost(currentUser, post).isPresent();
        }

        return new PostResponse(
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
            likeCount,
            commentCount,
            isLiked
        );
    }

    public ResponseEntity<?> getAllPosts(Long currentUserId) {
        List<PostResponse> posts = postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
            .map(post -> buildPostResponse(post, currentUserId))
            .collect(Collectors.toList());
        return ResponseEntity.ok(posts);
    }

    public ResponseEntity<?> getPostsById(long id, Long currentUserId) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        return ResponseEntity.ok(buildPostResponse(post, currentUserId));
    }

    public ResponseEntity<?> getPostByUserId(Long userId, Long currentUserId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<PostResponse> posts = postRepository.findByUser(user).stream()
            .map(post -> buildPostResponse(post, currentUserId))
            .collect(Collectors.toList());

        return ResponseEntity.ok(posts);
    }

    public ResponseEntity<?> getMyPosts(Long userId) {
        return getPostByUserId(userId, userId);
    }

    public ResponseEntity<?> likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return postReactionRepository.findByUserAndPost(user, post)
                .<ResponseEntity<Map<String, String>>>map(existingReaction -> {
                    postReactionRepository.delete(existingReaction);
                    return ResponseEntity.ok(Map.of("message", "Like removed"));
                })
                .orElseGet(() -> {
                    PostReaction reaction = PostReaction.builder()
                        .user(user)
                        .post(post)
                        .createdAt(LocalDateTime.now())
                        .build();
                    postReactionRepository.save(reaction);
                    return ResponseEntity.ok(Map.of("message", "Like added"));
                });


    }

    public Long getPostOwnerId(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        return post.getUser().getId();
    }

}

