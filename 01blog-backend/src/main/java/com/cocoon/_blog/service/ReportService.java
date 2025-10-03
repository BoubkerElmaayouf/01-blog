package com.cocoon._blog.service;

import com.cocoon._blog.dto.ReportRequest;
import com.cocoon._blog.entity.Report;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.ReportRepository;
import com.cocoon._blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public ResponseEntity<?> createReport(ReportRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Report report = new Report();
        report.setUser(user);
        report.setReason(request.getReason());
        report.setDescription(request.getDescription());
        report.setType(request.getType());

        reportRepository.save(report);
        return ResponseEntity.ok("Report submitted successfully");
    }

    public ResponseEntity<?> getAllReports() {
        List<Report> reports = reportRepository.findAll();
        return ResponseEntity.ok(reports);
    }

    public ResponseEntity<?> getReportById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        return ResponseEntity.ok(report);
    }

    public ResponseEntity<?> deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Report not found");
        }
        reportRepository.deleteById(id);
        return ResponseEntity.ok("Report deleted successfully");
    }
}
