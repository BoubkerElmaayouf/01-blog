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
            @RequestHeader("Authorization") String authHeader) 
    {

        try {
            String token = authHeader.replace("Bearer ", "");
            Long userIdFromToken = jwtService.extractId(token);
            String username = jwtService.extractUsername(token);

            if (!jwtService.validateToken(token, username)) {
                return ResponseEntity.status(401).build();
            }

            if (!userIdFromToken.equals(id)) {
                return ResponseEntity.status(403).build();
            }

            User updatedUser = authService.updateUser(id, userDto);
            UserDto updatedUserDto = authService.toUserDto(updatedUser);

            return ResponseEntity.ok(updatedUserDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
