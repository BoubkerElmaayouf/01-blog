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

    public ResponseEntity<?> createComment(CommentRequest request, Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

            Comment comment = Comment.builder()
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .user(user)
                .post(post)
                .build();

            Comment savedComment = commentRepository.save(comment);
            
            // Convert to DTO before returning
            CommentDto commentDto = new CommentDto();
            commentDto.setId(savedComment.getId());
            commentDto.setContent(savedComment.getContent());
            commentDto.setCreatedAt(savedComment.getCreatedAt());
            commentDto.setFirstName(savedComment.getUser().getFirstName());
            commentDto.setLastName(savedComment.getUser().getLastName());
            commentDto.setProfilePic(savedComment.getUser().getProfilePic());
            
            return ResponseEntity.ok(commentDto);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating comment: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getCommentsByPost(Long postId) {
        try {
            // Fetch the post
            Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

            // Fetch comments for the post, ordered by creation date descending
            List<Comment> comments = commentRepository.findAllByPostOrderByCreatedAtDesc(post);

            // Map Comment entities to CommentDto
            List<CommentDto> commentDtos = comments.stream()
                .map(comment -> {
                    CommentDto dto = new CommentDto();
                    dto.setId(comment.getId());
                    dto.setContent(comment.getContent());
                    dto.setCreatedAt(comment.getCreatedAt());
                    dto.setFirstName(comment.getUser().getFirstName());
                    dto.setLastName(comment.getUser().getLastName());
                    dto.setProfilePic(comment.getUser().getProfilePic());
                    return dto;
                })
                .toList();

            return ResponseEntity.ok(commentDtos);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching comments: " + e.getMessage());
        }
    }

    public ResponseEntity<?> likeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return commentReactionRepository.findByUserAndComment(user, comment)
            .map(existingReaction -> {
                // Already liked → remove
                commentReactionRepository.delete(existingReaction);
                return ResponseEntity.ok("Like removed");
            })
            .orElseGet(() -> {
                // Not liked yet → add
                CommentReaction reaction = CommentReaction.builder()
                    .user(user)
                    .comment(comment)
                    .createdAt(LocalDateTime.now())
                    .build();
                commentReactionRepository.save(reaction);
                return ResponseEntity.ok("Like added");
            });
    }

}