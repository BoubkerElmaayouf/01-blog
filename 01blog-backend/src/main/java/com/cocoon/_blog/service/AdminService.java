package com.cocoon._blog.service;

import com.cocoon._blog.dto.AdminPostDto;
import com.cocoon._blog.dto.AdminReportDto;
import com.cocoon._blog.dto.AdminUserDto;
import com.cocoon._blog.entity.Post;
import com.cocoon._blog.entity.Report;
import com.cocoon._blog.entity.User;
import com.cocoon._blog.repository.PostRepository;
import com.cocoon._blog.repository.ReportRepository;
import com.cocoon._blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportRepository reportRepository;

    // Users
    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            String username = user.getFirstName() + "_" + user.getLastName(); // match Angular mock data
            int postsCount = (int) postRepository.countByUser(user);
            String status = user.getBanned() ? "banned" : "active";
            return new AdminUserDto(user.getId(), username, user.getEmail(), user.getCreatedAt(), postsCount, status);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void banUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(true);
        userRepository.save(user);
    }

    @Transactional
    public void unbanUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(false);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Posts
    public List<AdminPostDto> getAllPosts() {
        return postRepository.findAll().stream().map(post -> {
            String author = post.getUser().getFirstName() + "_" + post.getUser().getLastName();
            String status = post.getTitle().contains("removed") ? "removed" : "published"; // or track a real status
            return new AdminPostDto(post.getId(), post.getTitle(), author, post.getCreatedAt(), 0, status);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void removePost(Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        post.setTitle(post.getTitle() + " [removed]"); // simple removed marker
        postRepository.save(post);
    }

    @Transactional
    public void restorePost(Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        post.setTitle(post.getTitle().replace(" [removed]", ""));
        postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

    // Reports
    public List<AdminReportDto> getAllReports() {
        return reportRepository.findAll().stream().map(report -> {
            String reporter = report.getUser().getFirstName() + "_" + report.getUser().getLastName();
            String reportedItem = report.getType().name().equals("POST") ? report.getDescription() : report.getReason();
            String itemType = report.getType().name().equals("POST") ? "post" : "user";
            String status = "pending"; // could be updated later
            return new AdminReportDto(report.getId(), reporter, reportedItem, itemType, report.getReason(), report.getCreatedAt(), status);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void resolveReport(Long id) {
        Report report = reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
        // mark as resolved in description or add a status field if needed
        report.setDescription(report.getDescription() + " [resolved]");
        reportRepository.save(report);
    }

    @Transactional
    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
}
