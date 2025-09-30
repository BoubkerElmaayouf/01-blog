package com.cocoon._blog.service;

import com.cocoon._blog.dto.ChangePasswordRequest;
import com.cocoon._blog.dto.LoginRequest;
import com.cocoon._blog.dto.RegisterRequest;
import com.cocoon._blog.dto.UserDto;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.CommentRepository;
import com.cocoon._blog.repository.PostReactionRepository;
import com.cocoon._blog.repository.PostRepository;
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

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostReactionRepository postReactionRepository;

    public User register(RegisterRequest request) {
        String profilePicture = request.getProfilePic();
        if (profilePicture.trim().isEmpty() || profilePicture == null) {
            profilePicture = "https://i.pinimg.com/736x/fc/cf/36/fccf365288b90c4a0a4fb410ca24c889.jpg";
        } 

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .bio(request.getBio())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.cocoon._blog.entity.Role.USER)
                .profilePic(profilePicture)
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

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDto toUserDto(User user) {
        int postCount = (int) postRepository.countByUser(user);
        int commentCount = (int) commentRepository.countByUser(user);
        int likeCount = (int) postReactionRepository.countByUser(user);

        return new UserDto(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getBio(),
            user.getProfilePic(),
            user.getRole(),
            postCount,
            commentCount,
            likeCount
        );
    }

    public User updateUser(Long id, UserDto userDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update fields if provided
        if (userDto.getFirstName() != null) existingUser.setFirstName(userDto.getFirstName());
        if (userDto.getLastName() != null) existingUser.setLastName(userDto.getLastName());
        if (userDto.getBio() != null) existingUser.setBio(userDto.getBio());
        if (userDto.getProfilePic() != null) existingUser.setProfilePic(userDto.getProfilePic());

        return userRepository.save(existingUser);
    }

    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
                
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword()))  {
            throw new RuntimeException("Old password is incorrect");
        }

        // validatePassword(request.getNewPassword());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }


    private void validatePassword(String password) {
        String regex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$";

        if (!password.matches(regex)) {
            throw new RuntimeException(
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            );
        }
    }
}
