package com.cocoon._blog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String title;
    private String topic;
    private String banner;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    private List<String> videos; // URLs only

    @Column(nullable = false)
    private boolean removed = false;

    @Column(nullable = false)
    private boolean isHidden = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Cascade delete post's comments
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;
    
    // Cascade delete post's reactions
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostReaction> reactions;
}
