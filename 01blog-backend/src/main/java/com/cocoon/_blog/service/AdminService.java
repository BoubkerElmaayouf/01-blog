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

    // ===================== USERS =====================

    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            String username = user.getFirstName() + "_" + user.getLastName();
            int postsCount = (int) postRepository.countByUser(user);
            String status = user.getBanned() ? "banned" : "active";
            return new AdminUserDto(
                    user.getId(),
                    username,
                    user.getEmail(),
                    user.getCreatedAt(),
                    postsCount,
                    status
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public void banUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Cannot ban an admin user");
        }
        user.setBanned(true);
        userRepository.save(user);
    }

    @Transactional
    public void unbanUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(false);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        // if (!userRepository.existsById(id)) {
        //     throw new RuntimeException("User not found");
        // }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));


        //System.out.println("Deleting user with ID: " + id + "<<<<<<<<>>>>>>>>>>>" + user.getEmail());
        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Cannot delete an admin user");
        }
        userRepository.delete(user);
    }

    // ===================== POSTS =====================

    public List<AdminPostDto> getAllPosts() {
        return postRepository.findAll().stream().map(post -> {
            String author = post.getUser() != null
                    ? post.getUser().getFirstName() + "_" + post.getUser().getLastName()
                    : "Unknown";
            String status = post.isHidden() ? "hidden" : "published";
            return new AdminPostDto(
                    post.getId(),
                    post.getTitle(),
                    author,
                    post.getCreatedAt(),
                    0,
                    status
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public void removePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        // post.setRemoved(true);
        // postRepository.save(post);
        postRepository.delete(post);
    }

    @Transactional
    public void restorePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setHidden(false);
        postRepository.save(post);
    }

    @Transactional
    public void hidePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setHidden(true);
        postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new RuntimeException("Post not found");
        }
        postRepository.deleteById(id);
    }

    // ===================== REPORTS =====================

    public List<AdminReportDto> getAllReports() {
        return reportRepository.findAll().stream().map(report -> {
            String reporter = report.getUser() != null
                    ? report.getUser().getFirstName() + "_" + report.getUser().getLastName()
                    : "Unknown";
            String reportedItem = report.getDescription();
            String itemType = report.getType() != null ? report.getType().name().toLowerCase() : "unknown";
            String status = report.isResolved() ? "resolved" : "pending";
            return new AdminReportDto(
                    report.getId(),
                    reporter,
                    reportedItem,
                    itemType,
                    report.getReason(),
                    report.getCreatedAt(),
                    status
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public void resolveReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setResolved(true);
        reportRepository.save(report);
    }

    @Transactional
    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new RuntimeException("Report not found");
        }
        reportRepository.deleteById(id);
    }
}
