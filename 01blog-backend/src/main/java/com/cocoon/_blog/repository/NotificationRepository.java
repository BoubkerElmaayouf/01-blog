package com.cocoon._blog.repository;

import com.cocoon._blog.entity.Notification;
import com.cocoon._blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
}
