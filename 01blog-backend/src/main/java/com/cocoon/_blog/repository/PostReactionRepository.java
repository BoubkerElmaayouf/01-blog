package com.cocoon._blog.repository;

import com.cocoon._blog.entity.PostReaction;
import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {
    Optional<PostReaction> findByUserAndPost(User user, Post post);
    long countByPost(Post post);
    long countByUser(User user);
}
