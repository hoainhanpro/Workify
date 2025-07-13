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

import com.workify.backend.dto.NoteCreateRequest;
import com.workify.backend.dto.NoteResponse;
import com.workify.backend.dto.NoteUpdateRequest;
import com.workify.backend.service.NoteService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class NoteController {
    
    @Autowired
    private NoteService noteService;
    
    /**
     * Tạo note mới
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> createNote(
            @Valid @RequestBody NoteCreateRequest request,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            NoteResponse noteResponse = noteService.createNote(request, userId);
            
            response.put("success", true);
            response.put("message", "Tạo ghi chú thành công");
            response.put("data", noteResponse);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi tạo ghi chú: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Lấy tất cả note của user hiện tại
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllNotes(HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            List<NoteResponse> notes = noteService.getAllNotesByUser(userId);
            
            response.put("success", true);
            response.put("data", notes);
            response.put("count", notes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách ghi chú: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Lấy note theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getNoteById(
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
            
            Optional<NoteResponse> note = noteService.getNoteById(id, userId);
            
            if (note.isPresent()) {
                response.put("success", true);
                response.put("data", note.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy ghi chú");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy ghi chú: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Cập nhật note
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> updateNote(
            @PathVariable String id,
            @Valid @RequestBody NoteUpdateRequest request,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Optional<NoteResponse> updatedNote = noteService.updateNote(id, request, userId);
            
            if (updatedNote.isPresent()) {
                response.put("success", true);
                response.put("message", "Cập nhật ghi chú thành công");
                response.put("data", updatedNote.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy ghi chú hoặc bạn không có quyền chỉnh sửa");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật ghi chú: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Xóa note
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteNote(
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
            
            boolean deleted = noteService.deleteNote(id, userId);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Xóa ghi chú thành công");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy ghi chú hoặc bạn không có quyền xóa");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi xóa ghi chú: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Tìm kiếm note theo tiêu đề
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> searchNotes(
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
            
            List<NoteResponse> notes = noteService.searchNotesByTitle(userId, keyword);
            
            response.put("success", true);
            response.put("data", notes);
            response.put("count", notes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi tìm kiếm ghi chú: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Thống kê số lượng note của user
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getNoteStats(HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            long noteCount = noteService.countNotesByUser(userId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalNotes", noteCount);
            
            response.put("success", true);
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thống kê: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
