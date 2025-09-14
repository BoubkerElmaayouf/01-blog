package com.cocoon._blog.service;

import com.cocoon._blog.dto.RegisterRequest;
import com.cocoon._blog.entity.Role;
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

    public User register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .bio(request.getBio())
                .profilePic(request.getProfilePic())
                .password(passwordEncoder.encode(request.getPassword())) // hash password
                .role(Role.USER) // default role
                .build();

        return userRepository.save(user);
    }
}
