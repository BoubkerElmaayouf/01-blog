package com.cocoon._blog.controller;

import com.cocoon._blog.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class SearchController {

    private final SearchService searchService;

  @GetMapping("/search")
    public ResponseEntity<?> searchPosts(@RequestParam(required = false) String query) {
        try {
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
