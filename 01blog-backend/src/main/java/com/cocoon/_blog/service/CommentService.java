package com.cocoon._blog.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.cocoon._blog.dto.CommentDto;
import com.cocoon._blog.dto.CommentRequest;
import com.cocoon._blog.entity.Comment;
import com.cocoon._blog.entity.CommentReaction;
import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.exception.UserBannedException;
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

    //  Create a new comment
    public CommentDto createComment(Long postId, CommentRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //  Prevent banned users from commenting
        if (user.getBanned()) {
            throw new UserBannedException("Your account has been banned. You cannot comment.");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent().trim())
                .createdAt(LocalDateTime.now())
                .user(user)
                .post(post)
                .build();

        Comment savedComment = commentRepository.save(comment);
        return mapToDto(savedComment, userId);
    }

    //  Get comments for a post
    public ResponseEntity<List<CommentDto>> getCommentsByPost(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<Comment> comments = commentRepository.findAllByPostOrderByCreatedAtDesc(post);

        List<CommentDto> dtos = comments.stream()
                .map(comment -> mapToDto(comment, currentUserId))
                .toList();

        return ResponseEntity.ok(dtos);
    }

    //  Like or unlike a comment
    public ResponseEntity<CommentDto> likeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent banned users from liking/unliking comments
        if (user.getBanned()) {
            throw new UserBannedException("Your account has been banned. You cannot react to comments.");
        }

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

    //  Helper to map Comment entity to DTO
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

    //  Get post owner's ID
    public Long getPostOwnerId(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return post.getUser().getId();
    }

public ResponseEntity<?> deleteComment(Long commentId, Long currentUserId) {
    Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

    User commentOwner = comment.getUser();
    User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    //  Check if current user is banned
    if (Boolean.TRUE.equals(currentUser.getBanned())) {
        return ResponseEntity.ok(Map.of("message", "Your account has been banned. You cannot perform this action."));
    }

    //  Check if current user is not the owner of the comment
    if (!commentOwner.getId().equals(currentUser.getId())) {
        return ResponseEntity.ok(Map.of("message", "You cannot delete another user's comment."));
    }

    //  Proceed with deletion
    commentRepository.deleteById(commentId);
    return ResponseEntity.ok(Map.of("message", "Comment deleted successfully."));
}

}
