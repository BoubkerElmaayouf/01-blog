package com.cocoon._blog.repository;

import com.cocoon._blog.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

// import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long>{
    // Optional<Post> findByEmail(String email);
}