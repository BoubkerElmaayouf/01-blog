package com.cocoon._blog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String type; 
    private Long senderId;
    private String senderName;
    private String senderProfilePic;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
