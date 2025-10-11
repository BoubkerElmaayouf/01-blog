
package com.cocoon._blog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto {
    private Long id;
    private String username; // Angular expects username
    private String email;
    private LocalDateTime joinDate;
    private int postsCount;
    private String status; // 'active' | 'banned'
}
