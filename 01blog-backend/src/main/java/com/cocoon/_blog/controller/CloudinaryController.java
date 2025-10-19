package com.cocoon._blog.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.cocoon._blog.entity.User;

import java.util.Map;

@RestController
@RequestMapping("/api/cloudinary")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class CloudinaryController {

    private final Cloudinary cloudinary;

    @PostMapping("/sign-upload")
    public ResponseEntity<?> signUpload(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You must be logged in to upload files"));
            }

            String folder = body.getOrDefault("folder", "posts");
            long timestamp = System.currentTimeMillis() / 1000;

            Map<String, Object> paramsToSign = ObjectUtils.asMap(
                    "timestamp", timestamp,
                    "folder", folder
            );

            String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);

            return ResponseEntity.ok(Map.of(
                    "timestamp", timestamp,
                    "signature", signature,
                    "apiKey", cloudinary.config.apiKey,
                    "cloudName", cloudinary.config.cloudName,
                    "folder", folder
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error signing upload", "error", e.getMessage()));
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteFile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        try {
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You must be logged in to delete files"));
            }

            String publicId = body.get("public_id");
            if (publicId == null || publicId.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "public_id is required"));
            }

            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete file", "error", e.getMessage()));
        }
    }
}
