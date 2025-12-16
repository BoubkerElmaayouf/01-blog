package com.cocoon._blog.service;

import com.cocoon._blog.dto.NotificationDto;
import com.cocoon._blog.entity.Notification;
import com.cocoon._blog.entity.NotificationType;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.exception.UserBannedException; //  use your custom exception
import com.cocoon._blog.repository.NotificationRepository;
import com.cocoon._blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Generic method for creating notifications.
     * Handles PROFILE, POST, and COMMENT types.
     */
    public void createNotification(
            Long senderId,
            Long recipientId,
            NotificationType type,
            Long postId,       // optional
            Long commentId,    // optional
            String customMessage // required custom message with emojis
    ) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        // Prevent banned users from sending notifications
        if (Boolean.TRUE.equals(sender.getBanned())) {
            throw new UserBannedException("Your account has been banned. You cannot perform this action.");
        }

        // Use only the custom message, no automatic sender name
        String message = (customMessage != null && !customMessage.isEmpty()) ?
                customMessage :
                switch (type) {
                    case PROFILE -> " started following you 🎉";
                    case POST -> " posted something 📢";
                    case COMMENT -> " commented on your post 💬";
                    default -> throw new IllegalArgumentException("Unsupported notification type");
                };

        Notification notification = Notification.builder()
                .sender(sender)
                .recipient(recipient)
                .type(type)
                .message(message)
                .postId(postId)
                .commentId(commentId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    // Get notifications for a user
    public List<NotificationDto> getUserNotifications(Long userId) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Mark notification as read
    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }

    // Map entity → DTO
    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType().name(),
                n.getSender().getId(),
                n.getSender().getFirstName() + " " + n.getSender().getLastName(),
                n.getSender().getProfilePic(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt(),
                n.getPostId(),
                n.getCommentId()
        );
    }
}
