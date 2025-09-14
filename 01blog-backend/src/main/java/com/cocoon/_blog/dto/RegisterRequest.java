package com.cocoon._blog.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String password;
    private String role;
    private String profilePic;
}
