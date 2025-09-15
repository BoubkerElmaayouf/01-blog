package com.cocoon._blog.dto;

import com.cocoon._blog.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PostDto {
    private Long id;
    private String firstName;
    private Role role;
}
