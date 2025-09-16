package com.cocoon._blog.repository;

import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUser(User user);
}