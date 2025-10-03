package com.cocoon._blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchUserPostResponse {
    // User info
    private Long userId;
    private String firstName;
    private String lastName;
    private String profilePic;
    private String bio;
    
    // Post info
    private Long postId;
    private String title;
    private String topic;
    private String banner;
    private LocalDateTime createdAt;
}
