package com.cocoon._blog.controller;

import com.cocoon._blog.dto.AdminUserDto;
import com.cocoon._blog.dto.AdminPostDto;
import com.cocoon._blog.dto.AdminReportDto;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.service.AdminService;
import com.cocoon._blog.service.AuthService;
import com.cocoon._blog.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;
    private final JwtService jwtService;

    /** Utility method to check if logged-in user is admin */
    private boolean isAdmin(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtService.extractUsername(token);
            Long userId = jwtService.extractId(token);

            if (!jwtService.validateToken(token, username)) {
                return false;
            }

            User user = authService.getUserById(userId);
            return user != null && authService.isAdmin(user);
        } catch (Exception e) {
            return false;
        }
    }

    // Users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/ban/{id}")
    public ResponseEntity<?> banUser(@PathVariable Long id,
                                     @RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        adminService.banUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/unban/{id}")
    public ResponseEntity<?> unbanUser(@PathVariable Long id,
                                       @RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        adminService.unbanUser(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Posts
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        return ResponseEntity.ok(adminService.getAllPosts());
    }

    @PostMapping("/posts/remove/{id}")
    public ResponseEntity<?> removePost(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        adminService.removePost(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts/restore/{id}")
    public ResponseEntity<?> restorePost(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        adminService.restorePost(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        adminService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    // Reports
    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        return ResponseEntity.ok(adminService.getAllReports());
    }

    @PostMapping("/reports/resolve/{id}")
    public ResponseEntity<?> resolveReport(@PathVariable Long id,
                                           @RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        adminService.resolveReport(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id,
                                          @RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(403).body("Admin access only");
        adminService.deleteReport(id);
        return ResponseEntity.ok().build();
    }
}
