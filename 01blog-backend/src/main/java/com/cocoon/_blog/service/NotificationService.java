package com.cocoon._blog.service;

import com.cocoon._blog.dto.NotificationDto;
import com.cocoon._blog.entity.Notification;
import com.cocoon._blog.entity.NotificationType;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.NotificationRepository;
import com.cocoon._blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Called when a user follows another
    public void createFollowNotification(Long senderId, Long recipientId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        String message = sender.getFirstName() + " " + sender.getLastName() + " started following you";
        LocalDateTime date = LocalDateTime.now();

        Notification notification = Notification.builder()
                .sender(sender)
                .type(NotificationType.PROFILE)
                .recipient(recipient)
                .message(message)
                .read(false)
                .createdAt(date)
                .build();

        System.out.println("------------->" +notification);

        notificationRepository.save(notification);
    }

    public List<NotificationDto> getUserNotifications(Long userId) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType().name(),
                n.getSender().getId(),
                n.getSender().getFirstName() + " " + n.getSender().getLastName(),
                n.getSender().getProfilePic(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
