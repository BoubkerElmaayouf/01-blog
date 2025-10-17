package com.cocoon._blog.service;

import com.cocoon._blog.dto.ChangePasswordRequest;
import com.cocoon._blog.dto.LoginRequest;
import com.cocoon._blog.dto.RegisterRequest;
import com.cocoon._blog.dto.UserDto;
import com.cocoon._blog.entity.Role;
import com.cocoon._blog.entity.User;
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

    public User register(RegisterRequest request) {
        String profilePicture = request.getProfilePic();
        if (profilePicture.trim().isEmpty() || profilePicture == null) {
            profilePicture = "https://i.pinimg.com/736x/fc/cf/36/fccf365288b90c4a0a4fb410ca24c889.jpg";
        }

        // if (request.getRole().equals("ADMIN")) {
        //     throw new RuntimeException("Cannot register as ADMIN");
        // }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .bio(request.getBio())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.cocoon._blog.entity.Role.USER)
                .banned(false)
                .profilePic(profilePicture)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        return userRepository.save(user);
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmailOrUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        

        if (user.getBanned() == true) {
            throw new RuntimeException("Your account has been banned Contact Support");
        }

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

    public boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
    }

}
