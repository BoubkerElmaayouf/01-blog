package com.cocoon._blog.dto;

import jakarta.validation.constraints.*;
import lombok.Data;


@Data
public class CommentRequest {
    @NotBlank(message = "Content is required")
    @Size(min = 5, max = 200, message = "Content must be between 5 and 200 characters")
    private String content;
    
    private Long postId;
    
}
