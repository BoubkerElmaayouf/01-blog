package com.cocoon._blog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users") // avoid reserved keyword "user"
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String bio;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String profilePic;

    private LocalDateTime createdAt = LocalDateTime.now();
}
