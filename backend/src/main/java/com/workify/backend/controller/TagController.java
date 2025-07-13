package com.workify.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workify.backend.dto.TagCreateRequest;
import com.workify.backend.dto.TagResponse;
import com.workify.backend.dto.TagUpdateRequest;
import com.workify.backend.service.TagService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/**
 * Tag Controller - RESTful API cho quản lý tags
 */
@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TagController {
    
    @Autowired
    private TagService tagService;
    
    /**
     * Tạo tag mới
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> createTag(
            @Valid @RequestBody TagCreateRequest request,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            TagResponse createdTag = tagService.createTag(request, userId);
            response.put("success", true);
            response.put("message", "Tạo tag thành công");
            response.put("data", createdTag);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi tạo tag: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Lấy tất cả tags của user
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllTags(HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            List<TagResponse> tags = tagService.getAllTagsByUser(userId);
            response.put("success", true);
            response.put("data", tags);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách tags: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Lấy tag theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getTagById(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Optional<TagResponse> tag = tagService.getTagById(id, userId);
            
            if (tag.isPresent()) {
                response.put("success", true);
                response.put("data", tag.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy tag");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thông tin tag: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Cập nhật tag
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> updateTag(
            @PathVariable String id,
            @Valid @RequestBody TagUpdateRequest request,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Optional<TagResponse> updatedTag = tagService.updateTag(id, request, userId);
            
            if (updatedTag.isPresent()) {
                response.put("success", true);
                response.put("message", "Cập nhật tag thành công");
                response.put("data", updatedTag.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy tag hoặc bạn không có quyền chỉnh sửa");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật tag: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Xóa tag
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteTag(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            boolean deleted = tagService.deleteTag(id, userId);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Xóa tag thành công");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy tag hoặc bạn không có quyền xóa");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi xóa tag: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Tìm kiếm tags theo tên
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> searchTags(
            @RequestParam String keyword,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            List<TagResponse> tags = tagService.searchTagsByName(userId, keyword);
            response.put("success", true);
            response.put("data", tags);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi tìm kiếm tags: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Lấy tags theo màu sắc
     */
    @GetMapping("/color/{color}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getTagsByColor(
            @PathVariable String color,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            List<TagResponse> tags = tagService.getTagsByColor(userId, "#" + color);
            response.put("success", true);
            response.put("data", tags);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy tags theo màu: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Lấy thống kê tags
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getTagStats(HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            long totalTags = tagService.countTagsByUser(userId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTags", totalTags);
            
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thống kê tags: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
