package com.cocoon._blog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users") // avoid reserved keyword "user"
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class User implements UserDetails {
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
    
    private Boolean banned;

    private String profilePic;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
       String roleName = (role != null) ? role.name() : "USER";
       return java.util.List.of(new SimpleGrantedAuthority("ROLE_"+roleName));
    }

    @Override
    public String getUsername() {
     return email;
    }
}
