package com.cocoon._blog.repository;

import com.cocoon._blog.entity.Followers;
import org.springframework.data.jpa.repository.JpaRepository;

// import java.util.Optional;

public interface FollowersRepository extends JpaRepository<Followers, Long>{
//   Optional<Followers> findByEmail(String email);
}