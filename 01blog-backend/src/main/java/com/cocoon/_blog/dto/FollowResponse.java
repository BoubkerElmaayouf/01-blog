package com.cocoon._blog.dto;

import lombok.Data;

@Data
public class FollowResponse {
    private Long followerId;
    private Long followingId;
    private boolean success;
    private String message;
}
