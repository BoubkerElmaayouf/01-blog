package com.cocoon._blog.controller;

import com.cocoon._blog.dto.ChangePasswordRequest;
import com.cocoon._blog.dto.FollowResponse;
import com.cocoon._blog.dto.LoginRequest;
import com.cocoon._blog.dto.RegisterRequest;
import com.cocoon._blog.dto.UserDto;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.service.AuthService;
import com.cocoon._blog.service.FollowService;
import com.cocoon._blog.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final FollowService followService;
    private final NotificationService notificationService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/user")
    public ResponseEntity<UserDto> getUser(@AuthenticationPrincipal User currentUser) {
        try {
            UserDto userDto = authService.toUserDto(currentUser);
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/user/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody UserDto userDto,
            @AuthenticationPrincipal User currentUser) {

        try {
            if (!currentUser.getId().equals(id)) {
                return ResponseEntity.status(403).build(); // Forbidden
            }

            // Prevent privilege escalation
            userDto.setRole(null);
            userDto.setEmail(null);

            User updatedUser = authService.updateUser(id, userDto);
            UserDto updatedUserDto = authService.toUserDto(updatedUser);

            return ResponseEntity.ok(updatedUserDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UserDto> getUserById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        try {
            User user = authService.getUserById(id);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            UserDto userDto = authService.toUserDto(user);
            return ResponseEntity.ok(userDto);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PatchMapping("/user/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User currentUser) {
        try {
            authService.changePassword(currentUser.getId(), request);
            return ResponseEntity.ok(Map.of("message", "password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/follow/{userId}")
    public ResponseEntity<FollowResponse> followUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {

        FollowResponse response = followService.follow(currentUser.getId(), userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/follow/{userId}")
    public ResponseEntity<FollowResponse> unfollowUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {

        FollowResponse response = followService.unfollow(currentUser.getId(), userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/follow/status/{userId}")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {

        boolean status = followService.isFollowing(currentUser.getId(), userId);
        return ResponseEntity.ok(Map.of("isFollowing", status));
    }
}
