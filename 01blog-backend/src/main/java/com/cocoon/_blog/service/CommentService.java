package com.cocoon._blog.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.cocoon._blog.dto.CommentDto;
import com.cocoon._blog.dto.CommentRequest;
import com.cocoon._blog.entity.Comment;
import com.cocoon._blog.entity.CommentReaction;
import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.CommentReactionRepository;
import com.cocoon._blog.repository.CommentRepository;
import com.cocoon._blog.repository.PostRepository;
import com.cocoon._blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentReactionRepository commentReactionRepository;

    // Create a new comment (authorization already handled in controller)
    public ResponseEntity<CommentDto> createComment(Long postId, CommentRequest request, Long userId) {
        // User and authorization already validated in controller
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent().trim())
                .createdAt(LocalDateTime.now())
                .user(user)
                .post(post)
                .build();

        Comment savedComment = commentRepository.save(comment);

        CommentDto dto = mapToDto(savedComment, userId);
        return ResponseEntity.ok(dto);
    }

    // Get comments for a post (authorization handled in controller)
    public ResponseEntity<List<CommentDto>> getCommentsByPost(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<Comment> comments = commentRepository.findAllByPostOrderByCreatedAtDesc(post);

        List<CommentDto> dtos = comments.stream()
                .map(comment -> mapToDto(comment, currentUserId))
                .toList();

        return ResponseEntity.ok(dtos);
    }

    // Like or unlike a comment (authorization handled in controller)
    public ResponseEntity<CommentDto> likeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isLiked = commentReactionRepository.findByUserAndComment(user, comment)
                .map(existingReaction -> {
                    commentReactionRepository.delete(existingReaction);
                    return false; // removed like
                })
                .orElseGet(() -> {
                    CommentReaction reaction = CommentReaction.builder()
                            .user(user)
                            .comment(comment)
                            .createdAt(LocalDateTime.now())
                            .build();
                    commentReactionRepository.save(reaction);
                    return true; // added like
                });

        CommentDto dto = mapToDto(comment, userId);
        dto.setLiked(isLiked);
        return ResponseEntity.ok(dto);
    }

    // Helper to map Comment entity to CommentDto
    private CommentDto mapToDto(Comment comment, Long currentUserId) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setFirstName(comment.getUser().getFirstName());
        dto.setLastName(comment.getUser().getLastName());
        dto.setProfilePic(comment.getUser().getProfilePic());

        int likeCount = commentReactionRepository.countByComment(comment);
        boolean isLiked = currentUserId != null && 
                commentReactionRepository.findByUserAndComment(
                    userRepository.findById(currentUserId).orElse(null), comment).isPresent();

        dto.setLikeCount(likeCount);
        dto.setLiked(isLiked);
        return dto;
    }
}