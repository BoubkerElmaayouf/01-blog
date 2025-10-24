package com.cocoon._blog.repository;

import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUser(User user);

    List<Post> findByUser(User user, Sort sort);

    long countByUser(User user);


    // Fetch posts from a list of users
    List<Post> findByUserIdIn(List<Long> userIds, Sort sort);
}
