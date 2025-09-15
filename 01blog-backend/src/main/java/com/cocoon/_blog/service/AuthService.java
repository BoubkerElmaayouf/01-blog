package com.cocoon._blog.service;

import com.cocoon._blog.config.JwtService;
import com.cocoon._blog.dto.LoginRequest;
import com.cocoon._blog.dto.RegisterRequest;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public User register(RegisterRequest request) {
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .bio(request.getBio())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.cocoon._blog.entity.Role.USER)
                .profilePic(request.getProfilePic())
                .build();
        return userRepository.save(user);
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmailOrUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // ✅ Return JWT token
        return jwtService.generateToken(user.getEmail(), user.getId(), user.getRole());
    }
}
