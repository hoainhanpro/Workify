package com.workify.backend.controller;

import java.io.IOException;
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
import org.springframework.web.multipart.MultipartFile;

import com.workify.backend.dto.NoteCreateRequest;
import com.workify.backend.dto.NoteResponse;
import com.workify.backend.dto.NoteUpdateRequest;
import com.workify.backend.dto.TagResponse;
import com.workify.backend.model.Attachment;
import com.workify.backend.model.Note;
import com.workify.backend.service.FileStorageService;
import com.workify.backend.service.NoteService;
import com.workify.backend.service.TagService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class NoteController {
    
    @Autowired
    private NoteService noteService;
    
    @Autowired
    private TagService tagService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
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
    
    // ================ GĐ5: ENDPOINTS CHO PIN VÀ TAG ================
    
    /**
     * GĐ5: Pin hoặc unpin note
     */
    @PutMapping("/{id}/pin")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> togglePinNote(
            @PathVariable String id,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy user ID từ JWT token
            String userId = (String) httpRequest.getAttribute("userId");
            
            Optional<NoteResponse> noteOpt = noteService.togglePinNote(id, userId);
            
            if (noteOpt.isPresent()) {
                response.put("success", true);
                response.put("message", noteOpt.get().getIsPinned() ? "Đã ghim note" : "Đã bỏ ghim note");
                response.put("data", noteOpt.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy note hoặc bạn không có quyền truy cập");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi pin/unpin note: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GĐ5: Cập nhật tags cho note
     */
    @PutMapping("/{id}/tags")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> updateNoteTags(
            @PathVariable String id,
            @RequestBody List<String> tagIds,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Optional<NoteResponse> noteOpt = noteService.updateNoteTags(id, tagIds, userId);
            
            if (noteOpt.isPresent()) {
                response.put("success", true);
                response.put("message", "Cập nhật tags thành công");
                response.put("data", noteOpt.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không tìm thấy ghi chú hoặc bạn không có quyền chỉnh sửa");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật tags: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GĐ5: Lấy danh sách notes đã pin của user
     */
    @GetMapping("/pinned")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getPinnedNotes(
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy user ID từ JWT token
            String userId = (String) httpRequest.getAttribute("userId");
            
            List<NoteResponse> pinnedNotes = noteService.getPinnedNotesByUser(userId);
            
            response.put("success", true);
            response.put("message", "Lấy danh sách notes đã pin thành công");
            response.put("data", pinnedNotes);
            response.put("total", pinnedNotes.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách notes đã pin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // ================ GĐ6: ENDPOINTS CHO TÌM KIẾM ================
    
    /**
     * GĐ6: Tìm kiếm notes theo từ khóa
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> searchNotes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy user ID từ JWT token
            String userId = (String) httpRequest.getAttribute("userId");
            
            List<NoteResponse> searchResults;
            
            if (tag != null && !tag.isEmpty()) {
                // Tìm kiếm theo tag
                searchResults = noteService.searchNotesByTag(userId, tag);
                response.put("message", "Tìm kiếm notes theo tag '" + tag + "' thành công");
            } else if (keyword != null && !keyword.isEmpty()) {
                // Tìm kiếm theo từ khóa
                searchResults = noteService.searchNotesByKeyword(userId, keyword);
                response.put("message", "Tìm kiếm notes theo từ khóa '" + keyword + "' thành công");
            } else {
                // Không có điều kiện tìm kiếm, trả về tất cả notes
                searchResults = noteService.getNotesByUser(userId);
                response.put("message", "Lấy tất cả notes thành công");
            }
            
            response.put("success", true);
            response.put("data", searchResults);
            response.put("total", searchResults.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi tìm kiếm notes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ================ THỐNG KÊ ================
    
    /**
     * Lấy thống kê notes của user
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserNoteStats(
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy user ID từ JWT token
            String userId = (String) httpRequest.getAttribute("userId");
            
            // Lấy thống kê cơ bản
            Map<String, Object> stats = new HashMap<>();
            
            List<NoteResponse> allNotes = noteService.getNotesByUser(userId);
            List<NoteResponse> pinnedNotes = noteService.getPinnedNotesByUser(userId);
            List<TagResponse> userTags = tagService.getAllTagsByUser(userId);
            
            stats.put("totalNotes", allNotes.size());
            stats.put("pinnedNotes", pinnedNotes.size());
            stats.put("totalTags", userTags.size());
            stats.put("unpinnedNotes", allNotes.size() - pinnedNotes.size());
            
            response.put("success", true);
            response.put("message", "Lấy thống kê thành công");
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thống kê: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GĐ6: Tìm kiếm notes theo tagId
     */
    @GetMapping("/search/tag/{tagId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> searchNotesByTag(
            @PathVariable String tagId,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            List<NoteResponse> notes = noteService.searchNotesByTag(userId, tagId);
            response.put("success", true);
            response.put("data", notes);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi tìm kiếm notes theo tag: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GĐ6: Tìm kiếm notes theo nhiều tagIds
     */
    @PostMapping("/search/tags")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> searchNotesByTags(
            @RequestBody List<String> tagIds,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Người dùng chưa được xác thực");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            if (tagIds == null || tagIds.isEmpty()) {
                response.put("success", false);
                response.put("message", "Danh sách tag không được để trống");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            List<NoteResponse> notes = noteService.searchNotesByTags(userId, tagIds);
            response.put("success", true);
            response.put("data", notes);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi tìm kiếm notes theo tags: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GĐ7: Upload files cho note (giới hạn 5MB/note)
     */
    @PostMapping("/{noteId}/upload")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadFiles(
            @PathVariable String noteId,
            @RequestParam("files") List<MultipartFile> files,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Không xác định được user");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            if (files == null || files.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không có file nào được chọn");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            Note updatedNote = noteService.uploadFiles(noteId, userId, files);
            
            response.put("success", true);
            response.put("message", "Upload thành công " + files.size() + " file(s)");
            response.put("data", updatedNote);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "Lỗi upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GĐ7: Lấy danh sách file của note
     */
    @GetMapping("/{noteId}/files")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getNoteFiles(
            @PathVariable String noteId,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Không xác định được user");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            List<Attachment> files = noteService.getNoteFiles(noteId, userId);
            
            response.put("success", true);
            response.put("data", files);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GĐ7: Xóa file khỏi note
     */
    @DeleteMapping("/{noteId}/files/{fileName}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteFileFromNote(
            @PathVariable String noteId,
            @PathVariable String fileName,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Không xác định được user");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Note updatedNote = noteService.deleteFileFromNote(noteId, userId, fileName);
            
            response.put("success", true);
            response.put("message", "Xóa file thành công");
            response.put("data", updatedNote);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi xóa file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GĐ7: Download file attachment
     */
    @GetMapping("/{noteId}/files/{fileName}/download")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable String noteId,
            @PathVariable String fileName,
            HttpServletRequest httpRequest) {
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Lấy thông tin file
            Attachment fileInfo = noteService.getFileInfo(noteId, userId, fileName);
            
            // Lấy nội dung file
            byte[] fileContent = noteService.getFileContent(noteId, userId, fileName);
            
            // Lấy content type
            String contentType = fileStorageService.getContentType(fileName);
            
            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Content-Length", String.valueOf(fileContent.length))
                    .header("Content-Disposition", "attachment; filename=\"" + fileInfo.getFileName() + "\"")
                    .body(fileContent);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * GĐ8: Export note to PDF format
     */
    @GetMapping("/{noteId}/export")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<byte[]> exportNote(
            @PathVariable String noteId,
            @RequestParam(defaultValue = "pdf") String format,
            HttpServletRequest httpRequest) {
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            byte[] exportData;
            String contentType;
            String fileExtension;
            
            switch (format.toLowerCase()) {
                case "pdf":
                    exportData = noteService.exportNoteToPdf(noteId, userId);
                    contentType = "application/pdf";
                    fileExtension = ".pdf";
                    break;
                    
                case "docx":
                    exportData = noteService.exportNoteToDocx(noteId, userId);
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    fileExtension = ".docx";
                    break;
                    
                default:
                    return ResponseEntity.badRequest().build();
            }
            
            // Lấy tên note để tạo filename
            Optional<NoteResponse> noteOpt = noteService.getNoteById(noteId, userId);
            if (!noteOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            String fileName = sanitizeFileName(noteOpt.get().getTitle()) + fileExtension;
            
            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Content-Length", String.valueOf(exportData.length))
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .body(exportData);
            
        } catch (IOException | RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Helper method to sanitize filename
     */
    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return "note_export";
        }
        
        // Remove invalid characters for filename
        return fileName.replaceAll("[\\\\/:*?\"<>|]", "_")
                      .replaceAll("\\s+", "_")
                      .substring(0, Math.min(fileName.length(), 50)); // Limit length
    }
}
