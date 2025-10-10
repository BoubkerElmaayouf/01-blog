package com.cocoon._blog.controller;

import com.cocoon._blog.dto.NotificationDto;
import com.cocoon._blog.service.JwtService;
import com.cocoon._blog.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getUserNotifications(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtService.extractUsername(token);
            System.out.println("Token from request = " + token);
            System.out.println("Extracted username = " + username);

            if (!jwtService.validateToken(token, username)) {
                System.out.println("❌ Invalid token for username: " + username);
                return ResponseEntity.status(401).build();
            }

            Long userId = jwtService.extractId(token);
            System.out.println("✅ Extracted userId = " + userId);

            return ResponseEntity.ok(notificationService.getUserNotifications(userId));
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            System.out.println("❌ Token expired");
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(403).build();
        }
    }


    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
