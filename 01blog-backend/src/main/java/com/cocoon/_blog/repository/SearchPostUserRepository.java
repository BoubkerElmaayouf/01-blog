package com.cocoon._blog.repository;

import com.cocoon._blog.dto.SearchUserPostResponse;
import com.cocoon._blog.entity.Post; // import your Post entity
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchPostUserRepository extends JpaRepository<Post, Long> {

    @Query("SELECT new com.cocoon._blog.dto.SearchUserPostResponse(" +
           "u.id, u.firstName, u.lastName, u.profilePic, u.bio, " +
           "p.id, p.title, p.topic, p.banner, p.createdAt) " +
           "FROM Post p JOIN p.user u " +
           "WHERE ( :query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.topic) LIKE LOWER(CONCAT('%', :query, '%')) ) " +
           "AND p.isHidden = false " +
           "ORDER BY p.createdAt DESC")
    List<SearchUserPostResponse> searchPostsAndUsers(@Param("query") String query);
}
