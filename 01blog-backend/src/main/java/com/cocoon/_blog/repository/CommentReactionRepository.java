package com.cocoon._blog.repository;

import com.cocoon._blog.entity.CommentReaction;
import com.cocoon._blog.entity.Comment;
import com.cocoon._blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {
    Optional<CommentReaction> findByUserAndComment(User user, Comment comment);
}
