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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;
    private final JwtService jwtService;


    // Users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/ban/{id}")
    public ResponseEntity<?> banUser(@PathVariable Long id) {
        adminService.banUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/unban/{id}")
    public ResponseEntity<?> unbanUser(@PathVariable Long id) {
        adminService.unbanUser(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Posts
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts() {
        return ResponseEntity.ok(adminService.getAllPosts());
    }

    @PostMapping("/posts/remove/{id}")
    public ResponseEntity<?> removePost(@PathVariable Long id ) {
        adminService.removePost(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts/restore/{id}")
    public ResponseEntity<?> restorePost(@PathVariable Long id) {
        adminService.restorePost(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id ) {
        adminService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    // Reports
    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports() {
        return ResponseEntity.ok(adminService.getAllReports());
    }

    @PostMapping("/reports/resolve/{id}")
    public ResponseEntity<?> resolveReport(@PathVariable Long id) {
        adminService.resolveReport(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id  ) {
        adminService.deleteReport(id);
        return ResponseEntity.ok().build();
    }
}
