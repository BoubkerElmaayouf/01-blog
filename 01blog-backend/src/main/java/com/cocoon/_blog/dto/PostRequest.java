package com.cocoon._blog.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class PostRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    private String title;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Banner URL is required")
    @Pattern(
        regexp = "^(http|https)://.*$",
        message = "Banner must be a valid URL"
    )
    private String banner;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 5000, message = "Description must be between 20 and 5000 characters")
    private String description;

    @Size(max = 5, message = "You can attach at most 5 videos")
    private List<
        @Pattern(
            regexp = "^(http|https)://.*$",
            message = "Each video must be a valid URL"
        )
        String
    > videos;
}
