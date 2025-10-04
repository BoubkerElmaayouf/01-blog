package com.cocoon._blog.controller;

import com.cocoon._blog.dto.ChangePasswordRequest;
import com.cocoon._blog.dto.FollowResponse;
import com.cocoon._blog.dto.LoginRequest;
import com.cocoon._blog.dto.RegisterRequest;
import com.cocoon._blog.dto.UserDto;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.service.AuthService;
import com.cocoon._blog.service.JwtService;
import com.cocoon._blog.service.NotificationService;
import com.cocoon._blog.service.FollowService;

// import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
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
    public ResponseEntity<UserDto> getUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring("Bearer ".length());
            Long userId = jwtService.extractId(token);

            User user = authService.getUserById(userId);
            UserDto userDto = authService.toUserDto(user);

            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PatchMapping("/user/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody UserDto userDto,
            @RequestHeader("Authorization") String authHeader) {

        try {
            String token = authHeader.replace("Bearer ", "");
            Long userIdFromToken = jwtService.extractId(token);
            String username = jwtService.extractUsername(token);

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.status(401).build(); // Unauthorized
            }

            if (!userIdFromToken.equals(id)) {
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
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtService.extractUsername(token);

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.status(401).build();
            }

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


    // changing the user password
    @PatchMapping("/user/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.extractId(token);
            String username = jwtService.extractUsername(token);

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            authService.changePassword(userId, request);
            return ResponseEntity.ok(Map.of("message", "password changed with success"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // follow 
    @PostMapping("/follow/{userId}")
    public ResponseEntity<FollowResponse> followUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long followerId = jwtService.extractId(token);

        FollowResponse response = followService.follow(followerId, userId);
        return ResponseEntity.ok(response);
    }


    // unfollow
    @DeleteMapping("/follow/{userId}")
    public ResponseEntity<FollowResponse> unfollowUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long followerId = jwtService.extractId(token);

        FollowResponse response = followService.unfollow(followerId, userId);
        return ResponseEntity.ok(response);
    }

    //followers state
    @GetMapping("/follow/status/{userId}")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Long followerId = jwtService.extractId(token);

        boolean status = followService.isFollowing(followerId, userId);
        return ResponseEntity.ok(Map.of("isFollowing", status));
    }
}
