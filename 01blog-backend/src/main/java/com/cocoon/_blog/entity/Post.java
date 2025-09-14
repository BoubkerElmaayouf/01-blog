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

    private LocalDateTime createdAt = LocalDateTime.now();
}
