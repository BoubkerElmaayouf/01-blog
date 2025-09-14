package com.cocoon._blog.repository;

import com.cocoon._blog.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

// // import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long>{
    // Optional<Comment> findByEmail(String email);
}