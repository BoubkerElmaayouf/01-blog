package com.cocoon._blog.dto;

import com.cocoon._blog.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String profilePic;
    private Role role;
    private int postCount;
    private int commentCount;
    private int likeCount;
    private int followersCount;  // ✅ how many follow me
    private int followingCount;  // ✅ how many I follow
}
