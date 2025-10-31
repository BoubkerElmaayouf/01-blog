package com.cocoon._blog.controller;

import com.cocoon._blog.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ===================== USERS =====================

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/ban/{id}")
    public ResponseEntity<?> banUser(@PathVariable Long id) {
        adminService.banUser(id);
        return ResponseEntity.ok("User banned successfully");
    }

    @PostMapping("/users/unban/{id}")
    public ResponseEntity<?> unbanUser(@PathVariable Long id) {
        adminService.unbanUser(id);
        return ResponseEntity.ok("User unbanned successfully");
    }

    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ===================== POSTS =====================

    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts() {
        return ResponseEntity.ok(adminService.getAllPosts());
    }

    @PostMapping("/posts/remove/{id}")
    public ResponseEntity<?> removePost(@PathVariable Long id) {
        adminService.removePost(id);
        return ResponseEntity.ok("Post removed successfully");
    }

    @PostMapping("/posts/restore/{id}")
    public ResponseEntity<?> restorePost(@PathVariable Long id) {
        adminService.restorePost(id);
        return ResponseEntity.ok("Post restored successfully");
    }

    @PostMapping("/posts/hide/{id}")
    public ResponseEntity<?> hidePost(@PathVariable Long id) {
        adminService.hidePost(id);
        return ResponseEntity.ok("Post hidden successfully");
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        adminService.deletePost(id);
        return ResponseEntity.ok("Post deleted successfully");
    }

    // ===================== REPORTS =====================

    @GetMapping("/reports")
    public ResponseEntity<?> getAllReports() {
        return ResponseEntity.ok(adminService.getAllReports());
    }

    @PostMapping("/reports/resolve/{id}")
    public ResponseEntity<?> resolveReport(@PathVariable Long id) {
        adminService.resolveReport(id);
        return ResponseEntity.ok("Report resolved successfully");
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        adminService.deleteReport(id);
        return ResponseEntity.ok("Report deleted successfully");
    }
}
