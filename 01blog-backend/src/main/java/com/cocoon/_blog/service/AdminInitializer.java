package com.cocoon._blog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final AuthService authService;

    @Override
    public void run(String... args) throws Exception {
        authService.ensureAdminExits();
    }
}
