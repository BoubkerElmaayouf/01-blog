package com.cocoon._blog.service;

import com.cocoon._blog.dto.ChangePasswordRequest;
import com.cocoon._blog.dto.LoginRequest;
import com.cocoon._blog.dto.RegisterRequest;
import com.cocoon._blog.dto.UserDto;
import com.cocoon._blog.entity.Role;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.exception.UserBannedException;
import com.cocoon._blog.repository.CommentRepository;
import com.cocoon._blog.repository.FollowersRepository;
import com.cocoon._blog.repository.PostReactionRepository;
import com.cocoon._blog.repository.PostRepository;
import com.cocoon._blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostReactionRepository postReactionRepository;
    private final FollowersRepository followersRepository;
    private final UserRepository userRepository;

    //  Register new user
    public User register(RegisterRequest request) {
        String profilePicture = request.getProfilePic();

        if (profilePicture == null || profilePicture.trim().isEmpty()) {
            profilePicture = "https://i.pinimg.com/736x/fc/cf/36/fccf365288b90c4a0a4fb410ca24c889.jpg";
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .bio(request.getBio())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .banned(false)
                .profilePic(profilePicture)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    //  Login user
    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmailOrUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBanned()) {
            throw new UserBannedException("Your account has been banned. Contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtService.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole(),
                user.getBanned()
        );
    }

    //  Get user by ID
    public User getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBanned()) {
            throw new UserBannedException("Your account has been banned. You cannot perform this action.");
        }

        return user;
    }

    //  Convert user to DTO
    public UserDto toUserDto(User user) {
        int postCount = (int) postRepository.countByUser(user);
        int commentCount = (int) commentRepository.countByUser(user);
        int likeCount = (int) postReactionRepository.countByUser(user);
        int followersCount = followersRepository.countById_FollowingId(user.getId());
        int followingCount = followersRepository.countById_FollowerId(user.getId());

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
                likeCount,
                followersCount,
                followingCount
        );
    }

    //  Update user profile
    public User updateUser(Long id, UserDto userDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (existingUser.getBanned()) {
            throw new UserBannedException("Your account has been banned. You cannot update your profile.");
        }

        if (userDto.getFirstName() != null) existingUser.setFirstName(userDto.getFirstName());
        if (userDto.getLastName() != null) existingUser.setLastName(userDto.getLastName());
        if (userDto.getBio() != null) existingUser.setBio(userDto.getBio());
        if (userDto.getProfilePic() != null) existingUser.setProfilePic(userDto.getProfilePic());

        return userRepository.save(existingUser);
    }

    //  Change user password
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBanned()) {
            throw new UserBannedException("Your account has been banned. Contact support.");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    //  Optional: validate password strength
    private void validatePassword(String password) {
        String regex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$";
        if (!password.matches(regex)) {
            throw new RuntimeException(
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
            );
        }
    }

    //  Ensure at least one admin exists
    public void ensureAdminExits() {
        if (userRepository.findByEmail("a@a.com").isEmpty()) {
            User admin = User.builder()
                    .firstName("ADMIN")
                    .lastName("1")
                    .email("a@a.com")
                    .password(passwordEncoder.encode("a@a.com"))
                    .role(Role.ADMIN)
                    .banned(false)
                    .profilePic("https://i.pinimg.com/736x/b4/1f/f4/b41ff478e42e31fd71584d9dae338ffa.jpg")
                    .build();

            userRepository.save(admin);
        }
    }

    //  Check if user is admin
    public boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
    }

    //  Check if user is banned
    public boolean isBanned(User user) {
        return user.getBanned();
    }
}
