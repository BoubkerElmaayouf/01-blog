package com.cocoon._blog.controller;

// import com.cocoon._blog.dto.AdminPostDto;
// import com.cocoon._blog.dto.AdminReportDto;
// import com.cocoon._blog.dto.AdminUserDto;
import com.cocoon._blog.service.AdminService;
import com.cocoon._blog.service.JwtService;
// import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class AdminController {

    private final AdminService adminService;
    private final JwtService jwtService;

    // ------------------- USERS -------------------
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            return ResponseEntity.ok(adminService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching users: " + e.getMessage());
        }
    }

    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long id,
                                     @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            adminService.banUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error banning user: " + e.getMessage());
        }
    }

    @PatchMapping("/users/{id}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable Long id,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            adminService.unbanUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error unbanning user: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            adminService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting user: " + e.getMessage());
        }
    }

    // ------------------- POSTS -------------------
    @GetMapping("/posts")
    public ResponseEntity<?> getPosts(@RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            return ResponseEntity.ok(adminService.getAllPosts());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching posts: " + e.getMessage());
        }
    }

    @PatchMapping("/posts/{id}/remove")
    public ResponseEntity<?> removePost(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            adminService.removePost(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error removing post: " + e.getMessage());
        }
    }

    @PatchMapping("/posts/{id}/restore")
    public ResponseEntity<?> restorePost(@PathVariable Long id,
                                         @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            adminService.restorePost(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error restoring post: " + e.getMessage());
        }
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            adminService.deletePost(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting post: " + e.getMessage());
        }
    }

    // ------------------- REPORTS -------------------
    @GetMapping("/reports")
    public ResponseEntity<?> getReports(@RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            return ResponseEntity.ok(adminService.getAllReports());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching reports: " + e.getMessage());
        }
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable Long id,
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            adminService.resolveReport(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error resolving report: " + e.getMessage());
        }
    }

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id,
                                          @RequestHeader("Authorization") String authHeader) {
        try {
            Long adminId = validateTokenAndGetUserId(authHeader);
            adminService.deleteReport(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting report: " + e.getMessage());
        }
    }

    // ------------------- HELPER -------------------
    private Long validateTokenAndGetUserId(String authHeader) throws Exception {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new Exception("Missing or invalid Authorization header");
        }

        String token = authHeader.replace("Bearer ", "");
        Long userId = jwtService.extractId(token);
        String username = jwtService.extractUsername(token);

        if (!jwtService.validateToken(token, username)) {
            throw new Exception("Invalid or expired token");
        }
        return userId;
    }
}
