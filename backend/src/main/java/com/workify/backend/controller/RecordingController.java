package com.workify.backend.controller;

import com.workify.backend.model.Recording;
import com.workify.backend.security.RequireAuth;
import com.workify.backend.security.SecurityUtils;
import com.workify.backend.service.RecordingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recordings")
public class RecordingController {

    @Autowired
    private RecordingService recordingService;

    /**
     * Endpoint để tải lên file ghi âm
     */
    @PostMapping("/upload")
    @RequireAuth
    public ResponseEntity<?> uploadRecording(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title) {
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Recording newRecording = recordingService.storeAndCreateRecording(file, title, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(newRecording);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            // Return a specific error for duration extraction failure
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Không thể trích xuất thời lượng file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Không thể tải lên file: " + e.getMessage()));
        }
    }

    /**
     * Endpoint để lấy danh sách tất cả bản ghi của người dùng hiện tại
     */
    @GetMapping
    @RequireAuth
    public ResponseEntity<List<Recording>> getUserRecordings() {
        String userId = SecurityUtils.getCurrentUserId();
        List<Recording> recordings = recordingService.getRecordingsByUserId(userId);
        return ResponseEntity.ok(recordings);
    }

    /**
     * Endpoint để lấy chi tiết một bản ghi
     */
    @GetMapping("/{id}")
    @RequireAuth
    public ResponseEntity<?> getRecordingById(@PathVariable String id) {
        try {
            String userId = SecurityUtils.getCurrentUserId();
            return recordingService.getRecordingById(id)
                .filter(recording -> recording.getUserId().equals(userId))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Không thể lấy thông tin bản ghi: " + e.getMessage()));
        }
    }

    /**
     * Endpoint để phát file âm thanh
     */
    @GetMapping("/files/{filename}")
    @RequireAuth
    public ResponseEntity<Resource> getAudioFile(@PathVariable String filename) {
        try {
            Resource file = recordingService.loadAudioFile(filename);
            
            // Xác định content type dựa trên phần mở rộng file
            String contentType = getContentType(filename);
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(file);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint để phát file âm thanh với token từ URL parameter (dành cho HTML audio tag)
     */
    @GetMapping("/stream/{filename}")
    public ResponseEntity<Resource> streamAudioFile(
            @PathVariable String filename,
            @RequestParam(value = "token", required = false) String token) {
        try {
            // Validate token manually nếu có
            if (token != null && !token.isEmpty()) {
                // TODO: Validate JWT token here
                // For now, we'll allow it if token exists
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            Resource file = recordingService.loadAudioFile(filename);
            
            // Xác định content type dựa trên phần mở rộng file
            String contentType = getContentType(filename);
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .body(file);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint để cập nhật thông tin bản ghi
     */
    @PutMapping("/{id}")
    @RequireAuth
    public ResponseEntity<?> updateRecording(
            @PathVariable String id,
            @RequestBody Map<String, Object> updateData) {
        try {
            String userId = SecurityUtils.getCurrentUserId();
            String title = (String) updateData.get("title");
            @SuppressWarnings("unchecked")
            List<String> tagIds = (List<String>) updateData.get("tagIds");
            
            Recording updatedRecording = recordingService.updateRecording(id, title, tagIds, userId);
            return ResponseEntity.ok(updatedRecording);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Không thể cập nhật bản ghi: " + e.getMessage()));
        }
    }

    /**
     * Endpoint để xóa bản ghi
     */
    @DeleteMapping("/{id}")
    @RequireAuth
    public ResponseEntity<?> deleteRecording(@PathVariable String id) {
        try {
            String userId = SecurityUtils.getCurrentUserId();
            recordingService.deleteRecording(id, userId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa bản ghi thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Không thể xóa bản ghi: " + e.getMessage()));
        }
    }

    /**
     * Endpoint để lấy thống kê bản ghi
     */
    @GetMapping("/stats")
    @RequireAuth
    public ResponseEntity<RecordingService.RecordingStats> getRecordingStats() {
        try {
            String userId = SecurityUtils.getCurrentUserId();
            RecordingService.RecordingStats stats = recordingService.getRecordingStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Xác định content type dựa trên phần mở rộng file
     */
    private String getContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        
        switch (extension) {
            case "mp3":
                return "audio/mpeg";
            case "wav":
                return "audio/wav";
            case "m4a":
                return "audio/mp4";
            case "aac":
                return "audio/aac";
            case "ogg":
                return "audio/ogg";
            case "flac":
                return "audio/flac";
            case "wma":
                return "audio/x-ms-wma";
            default:
                return "audio/mpeg"; // Default fallback
        }
    }
}
