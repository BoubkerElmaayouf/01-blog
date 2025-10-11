package com.cocoon._blog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportDto {
    private Long id;
    private String reporterUsername;
    private String reportedItem; // post title or username
    private String itemType; // 'user' | 'post'
    private String reason;
    private LocalDateTime reportDate;
    private String status; // 'pending' | 'resolved'
}
