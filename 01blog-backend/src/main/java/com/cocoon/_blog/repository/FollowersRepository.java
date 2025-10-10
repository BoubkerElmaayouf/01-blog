package com.cocoon._blog.repository;

import com.cocoon._blog.entity.Followers;
import com.cocoon._blog.entity.FollowersId;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowersRepository extends JpaRepository<Followers, FollowersId> {
    Optional<Followers> findById(FollowersId id);
    List<Followers> findByIdFollowingId(Long followingId);

    int countById_FollowingId(Long followingId); // followers count
    int countById_FollowerId(Long followerId);   // following count
}
