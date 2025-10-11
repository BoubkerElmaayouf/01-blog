package com.cocoon._blog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPostDto {
    private Long id;
    private String title;
    private String author; // username of post owner
    private LocalDateTime publishDate;
    private int views;
    private String status; // 'published' | 'removed'
}
