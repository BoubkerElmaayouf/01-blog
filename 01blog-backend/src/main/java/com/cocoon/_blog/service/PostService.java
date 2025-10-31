package com.cocoon._blog.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Collections;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import com.cocoon._blog.dto.PostRequest;
import com.cocoon._blog.dto.PostResponse;
import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.PostReaction;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.exception.UserBannedException;
import com.cocoon._blog.repository.CommentRepository;
import com.cocoon._blog.repository.FollowersRepository;
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
    private final FollowersRepository followersRepository;

    // 🔹 Create a post
    public Post createPost(PostRequest request, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getBanned())) {
            throw new UserBannedException("Your account has been banned. You cannot perform this action.");
        }

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
        return post;
    }

    // 🔹 Update a post
    public Post updatePost(Long postId, PostRequest request, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (Boolean.TRUE.equals(user.getBanned())) {
            throw new UserBannedException("Your account has been banned. You cannot perform this action.");
        }

        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to edit this post");
        }

        post.setTitle(request.getTitle());
        post.setTopic(request.getTopic());
        post.setBanner(request.getBanner());
        post.setDescription(request.getDescription());
        post.setVideos(request.getVideos());
        post.setCreatedAt(LocalDateTime.now());

        postRepository.save(post);
        return post;
    }

    // 🔹 Build PostResponse with like status
    public PostResponse buildPostResponse(Post post, Long currentUserId) {
        int likeCount = (int) postReactionRepository.countByPost(post);
        int commentCount = (int) commentRepository.countByPost(post);

        boolean isLiked = false;
        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            isLiked = postReactionRepository.findByUserAndPost(currentUser, post).isPresent();
        }

        // if(post.isHidden()) {
        //     return null;
        // }

        return new PostResponse(
            post.getUser().getId(),
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

    // 🔹 Get all posts with pagination
    public ResponseEntity<?> getAllPosts(Long currentUserId, int page, int size) {
        List<Long> followedIds = followersRepository.findFollowingIdsByFollowerId(currentUserId);

        List<Long> userIds = new ArrayList<>(followedIds);
        userIds.add(currentUserId);

        if (userIds.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "content", Collections.emptyList(),
                "currentPage", 0,
                "totalPages", 0,
                "totalElements", 0L,
                "hasNext", false
            ));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        // Page<Post> postsPage = postRepository.findByUserIdIn(userIds, pageable);
        Page<Post> postsPage = postRepository.findByUserIdInAndIsHiddenFalse(userIds, pageable);


        List<PostResponse> content = postsPage.getContent().stream()
            .map(post -> buildPostResponse(post, currentUserId))
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "content", content,
            "currentPage", postsPage.getNumber(),
            "totalPages", postsPage.getTotalPages(),
            "totalElements", postsPage.getTotalElements(),
            "hasNext", postsPage.hasNext()
        ));
    }

    // 🔹 Get post by ID
    public ResponseEntity<?> getPostsById(long id, Long currentUserId) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        return ResponseEntity.ok(buildPostResponse(post, currentUserId));
    }

    // 🔹 Get posts by user ID
    public ResponseEntity<?> getPostByUserId(Long userId, Long currentUserId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<PostResponse> posts = postRepository.findByUser(user, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
            .map(post -> buildPostResponse(post, currentUserId))
            .collect(Collectors.toList());

        return ResponseEntity.ok(posts);
    }

    // 🔹 Get current user's posts
    public ResponseEntity<?> getMyPosts(Long userId) {
        return getPostByUserId(userId, userId);
    }

    // 🔹 Like or unlike a post
    public ResponseEntity<?> likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (Boolean.TRUE.equals(user.getBanned())) {
            throw new UserBannedException("Your account has been banned. You cannot perform this action.");
        }

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

    // 🔹 Get post owner's ID
    public Long getPostOwnerId(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        return post.getUser().getId();
    }

    // 🔹 Delete a post
    public ResponseEntity<?> deletePost(Long id, Long userId) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (Boolean.TRUE.equals(user.getBanned())) {
            throw new UserBannedException("Your account has been banned. You cannot perform this action.");
        }

        if (post.getUser().getId().equals(userId)) {
            postRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Post deleted"));
        } else {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You are not allowed to delete this post"));
        }
    }
}