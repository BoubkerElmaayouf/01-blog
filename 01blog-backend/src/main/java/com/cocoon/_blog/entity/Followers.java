package com.cocoon._blog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "followers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Followers {

    @EmbeddedId
    private FollowersId id;

    @Column(nullable = false)
    private LocalDateTime followedAt = LocalDateTime.now();
}
