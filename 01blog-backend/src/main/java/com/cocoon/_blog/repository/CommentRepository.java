package com.cocoon._blog.repository;

import com.cocoon._blog.entity.Comment;
import com.cocoon._blog.entity.Post;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

// import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> { 
    List<Comment> findAllByPostOrderByCreatedAtDesc(Post post);
}
