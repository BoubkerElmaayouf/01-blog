package com.cocoon._blog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.*;
import java.time.*;


@Data
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String topic;
    private String banner;
    private String description;
    private List<String> videos;
    private LocalDateTime createdAt;
    private String firstName;
    private String lastName;
    private String profilePic;
    private int likeCount;
    private int commentCount;
    private boolean isLiked;
}