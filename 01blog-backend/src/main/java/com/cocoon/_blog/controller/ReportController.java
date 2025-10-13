package com.cocoon._blog.controller;

import com.cocoon._blog.dto.ReportRequest;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/create")
    public ResponseEntity<?> createReport(
            @Valid @RequestBody ReportRequest request,
            BindingResult bindingResult,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            if (bindingResult.hasErrors()) {
                String errors = bindingResult.getAllErrors()
                        .stream()
                        .map(err -> err.getDefaultMessage())
                        .reduce((m1, m2) -> m1 + ", " + m2)
                        .orElse("Invalid input");
                return ResponseEntity.badRequest().body(Map.of("error", errors));
            }

            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            var report = reportService.createReport(request, currentUser.getId());

            return ResponseEntity.ok(Map.of(
                    "message", "Report submitted successfully",
                    "report", report
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error creating report: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllReports(@AuthenticationPrincipal User currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            var reports = reportService.getAllReports();
            return ResponseEntity.ok(Map.of("reports", reports));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching reports: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReportById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            var report = reportService.getReportById(id);
            return ResponseEntity.ok(Map.of("report", report));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching report: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            reportService.deleteReport(id);
            return ResponseEntity.ok(Map.of("message", "Report deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error deleting report: " + e.getMessage()));
        }
    }
}
