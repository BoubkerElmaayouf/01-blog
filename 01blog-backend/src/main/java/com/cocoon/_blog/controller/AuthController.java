package com.cocoon._blog.controller;

import com.cocoon._blog.dto.LoginRequest;
import com.cocoon._blog.dto.RegisterRequest;
import com.cocoon._blog.dto.UserDto;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.service.AuthService;
import com.cocoon._blog.service.JwtService;

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

            // Extract userId from token
            Long userId = jwtService.extractId(token);

            // Fetch user from DB
            User user = authService.getUserById(userId);

            // Map entity -> DTO
            UserDto userDto = new UserDto(
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getBio(),
                    user.getProfilePic(),
                    user.getRole()
            );

            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }


    // user update
    @PatchMapping("/user")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody UserDto userDto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userIdFromToken = jwtService.extractId(token);
            String username = jwtService.extractUsername(token);

            // Validate token
            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.status(401).build(); // Unauthorized
            }

            // Ensure user can only update their own profile
            if (!userIdFromToken.equals(id)) {
                return ResponseEntity.status(403).build(); // Forbidden
            }

            // Update user
            User updatedUser = authService.updateUser(id, userDto);

            // Map to DTO
            UserDto updatedUserDto = new UserDto(
                    updatedUser.getId(),
                    updatedUser.getFirstName(),
                    updatedUser.getLastName(),
                    updatedUser.getEmail(),
                    updatedUser.getBio(),
                    updatedUser.getProfilePic(),
                    updatedUser.getRole()
            );

            return ResponseEntity.ok(updatedUserDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }


}
