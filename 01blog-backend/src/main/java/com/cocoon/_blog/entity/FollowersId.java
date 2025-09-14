package com.cocoon._blog.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowersId implements Serializable {
    private Long followerId;
    private Long followingId;
}
