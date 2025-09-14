package com.cocoon._blog.dto;
import lombok.Data;

@Data

public class LoginRequest {
    private String emailOrUsername;
    private String password;
}