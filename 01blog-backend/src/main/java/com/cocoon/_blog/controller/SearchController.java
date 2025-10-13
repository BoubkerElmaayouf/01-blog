package com.cocoon._blog.controller;

import com.cocoon._blog.entity.User;
import com.cocoon._blog.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(
            @RequestParam(required = false) String query,
            @AuthenticationPrincipal User currentUser) {
        try {
            // Optional: use currentUser.getId() for personalized search or access control
            var results = searchService.search(query);
            return ResponseEntity.ok(Map.of(
                    "message", "Search results fetched successfully",
                    "data", results
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Error searching posts: " + e.getMessage()
            ));
        }
    }
}
