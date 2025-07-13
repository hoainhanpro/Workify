package com.workify.backend.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.workify.backend.dto.NoteCreateRequest;
import com.workify.backend.dto.NoteResponse;
import com.workify.backend.dto.NoteUpdateRequest;
import com.workify.backend.dto.TagResponse;
import com.workify.backend.model.Attachment;
import com.workify.backend.model.Note;
import com.workify.backend.repository.NoteRepository;

@Service
public class NoteService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private TagService tagService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Tạo note mới
     */
    public NoteResponse createNote(NoteCreateRequest request, String authorId) {
        // Validate tagIds nếu có
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            for (String tagId : request.getTagIds()) {
                if (!tagService.isTagOwnedByUser(tagId, authorId)) {
                    throw new IllegalArgumentException("Tag với ID '" + tagId + "' không tồn tại hoặc không thuộc về bạn");
                }
            }
        }
        
        Note note = new Note(request.getTitle(), request.getContent(), authorId);
        note.setTagIds(request.getTagIds());
        note.setIsPinned(request.getIsPinned());
        
        Note savedNote = noteRepository.save(note);
        return populateTagsInResponse(savedNote);
    }
    
    /**
     * Helper method: Populate tag details vào NoteResponse
     */
    private NoteResponse populateTagsInResponse(Note note) {
        NoteResponse response = new NoteResponse(note);
        
        if (note.getTagIds() != null && !note.getTagIds().isEmpty()) {
            List<TagResponse> tags = new ArrayList<>();
            for (String tagId : note.getTagIds()) {
                Optional<TagResponse> tagOpt = tagService.getTagById(tagId, note.getAuthorId());
                tagOpt.ifPresent(tags::add);
            }
            response.setTags(tags);
        }
        
        return response;
    }
    
    /**
     * Lấy tất cả note của user
     */
    public List<NoteResponse> getAllNotesByUser(String authorId) {
        List<Note> notes = noteRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy note theo ID
     */
    public Optional<NoteResponse> getNoteById(String noteId, String authorId) {
        Optional<Note> note = noteRepository.findById(noteId);
        
        if (note.isPresent() && note.get().getAuthorId().equals(authorId)) {
            return Optional.of(populateTagsInResponse(note.get()));
        }
        
        return Optional.empty();
    }
    
    /**
     * Cập nhật note
     */
    public Optional<NoteResponse> updateNote(String noteId, NoteUpdateRequest request, String authorId) {
        Optional<Note> noteOpt = noteRepository.findById(noteId);
        
        if (noteOpt.isEmpty() || !noteOpt.get().getAuthorId().equals(authorId)) {
            return Optional.empty();
        }
        
        Note note = noteOpt.get();
        
        // Chỉ cập nhật các trường không null
        if (request.getTitle() != null) {
            note.setTitle(request.getTitle());
        }
        
        if (request.getContent() != null) {
            note.setContent(request.getContent());
        }
        
        // GĐ5: Cập nhật tagIds nếu có
        if (request.getTagIds() != null) {
            // Validate tagIds
            for (String tagId : request.getTagIds()) {
                if (!tagService.isTagOwnedByUser(tagId, authorId)) {
                    throw new IllegalArgumentException("Tag với ID '" + tagId + "' không tồn tại hoặc không thuộc về bạn");
                }
            }
            note.setTagIds(request.getTagIds());
        }
        
        // GĐ5: Cập nhật isPinned nếu có
        if (request.getIsPinned() != null) {
            note.setIsPinned(request.getIsPinned());
        }
        
        Note updatedNote = noteRepository.save(note);
        return Optional.of(populateTagsInResponse(updatedNote));
    }
    
    /**
     * Xóa note
     */
    public boolean deleteNote(String noteId, String authorId) {
        Optional<Note> note = noteRepository.findById(noteId);
        
        if (note.isPresent() && note.get().getAuthorId().equals(authorId)) {
            noteRepository.deleteById(noteId);
            return true;
        }
        
        return false;
    }
    
    /**
     * Tìm kiếm note theo tiêu đề
     */
    public List<NoteResponse> searchNotesByTitle(String authorId, String keyword) {
        List<Note> notes = noteRepository.findByAuthorIdAndTitleContainingIgnoreCase(authorId, keyword);
        return notes.stream()
                .map(NoteResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Đếm số lượng note của user
     */
    public long countNotesByUser(String authorId) {
        return noteRepository.countByAuthorId(authorId);
    }
    
    // GĐ5: Pin/Unpin note
    public Optional<NoteResponse> togglePinNote(String noteId, String authorId) {
        Optional<Note> noteOpt = noteRepository.findById(noteId);
        
        if (noteOpt.isEmpty() || !noteOpt.get().getAuthorId().equals(authorId)) {
            return Optional.empty();
        }
        
        Note note = noteOpt.get();
        note.setIsPinned(!note.getIsPinned()); // Toggle pin status
        
        Note updatedNote = noteRepository.save(note);
        return Optional.of(populateTagsInResponse(updatedNote));
    }
    
    // GĐ5: Lấy tất cả note được pin của user
    public List<NoteResponse> getPinnedNotesByUser(String authorId) {
        List<Note> notes = noteRepository.findByAuthorIdAndIsPinnedTrueOrderByCreatedAtDesc(authorId);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ5: Cập nhật tags cho note
    public Optional<NoteResponse> updateNoteTags(String noteId, List<String> tagIds, String authorId) {
        Optional<Note> noteOpt = noteRepository.findById(noteId);
        
        if (noteOpt.isEmpty() || !noteOpt.get().getAuthorId().equals(authorId)) {
            return Optional.empty();
        }
        
        Note note = noteOpt.get();
        
        // Validate tagIds
        if (tagIds != null) {
            for (String tagId : tagIds) {
                if (!tagService.isTagOwnedByUser(tagId, authorId)) {
                    throw new IllegalArgumentException("Tag với ID '" + tagId + "' không tồn tại hoặc không thuộc về bạn");
                }
            }
        }
        
        note.setTagIds(tagIds);
        
        Note updatedNote = noteRepository.save(note);
        return Optional.of(populateTagsInResponse(updatedNote));
    }
    
    // GĐ6: Tìm kiếm note theo tagId
    public List<NoteResponse> searchNotesByTag(String authorId, String tagId) {
        // Validate tag ownership
        if (!tagService.isTagOwnedByUser(tagId, authorId)) {
            throw new IllegalArgumentException("Tag không tồn tại hoặc không thuộc về bạn");
        }
        
        List<Note> notes = noteRepository.findByAuthorIdAndTagIdsContainingOrderByCreatedAtDesc(authorId, tagId);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ6: Tìm kiếm note theo nhiều tagIds
    public List<NoteResponse> searchNotesByTags(String authorId, List<String> tagIds) {
        // Validate all tags
        for (String tagId : tagIds) {
            if (!tagService.isTagOwnedByUser(tagId, authorId)) {
                throw new IllegalArgumentException("Tag với ID '" + tagId + "' không tồn tại hoặc không thuộc về bạn");
            }
        }
        
        List<Note> notes = noteRepository.findByAuthorIdAndTagIdsInOrderByCreatedAtDesc(authorId, tagIds);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ6: Tìm kiếm note theo keyword (trong title và content)
    public List<NoteResponse> searchNotesByKeyword(String authorId, String keyword) {
        List<Note> notes = noteRepository.findByAuthorIdAndTitleContainingIgnoreCaseOrAuthorIdAndContentContainingIgnoreCaseOrderByCreatedAtDesc(
            authorId, keyword, authorId, keyword);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ6: Lấy tất cả notes của user (method này đã có trong getAllNotes nhưng cần tách riêng)
    public List<NoteResponse> getNotesByUser(String authorId) {
        List<Note> notes = noteRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ6: Lấy danh sách tất cả tags unique của user (deprecated - dùng TagService thay thế)
    @Deprecated
    public List<String> getAllTagsByUser(String authorId) {
        // Gọi TagService để lấy danh sách tags
        List<TagResponse> userTags = tagService.getAllTagsByUser(authorId);
        return userTags.stream()
                .map(TagResponse::getName)
                .collect(Collectors.toList());
    }
    
    /**
     * GĐ7: Upload file cho note với kiểm tra giới hạn 5MB
     */
    public Note uploadFiles(String noteId, String authorId, List<MultipartFile> files) throws IOException {
        // Tìm note
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        // Kiểm tra quyền
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền upload file cho note này");
        }
        
        // Tính tổng dung lượng hiện tại
        long currentTotalSize = fileStorageService.calculateTotalSize(note.getAttachments());
        
        // Tính tổng dung lượng file mới
        long newFilesTotalSize = files.stream()
                .mapToLong(MultipartFile::getSize)
                .sum();
        
        // Kiểm tra giới hạn 5MB
        fileStorageService.validateTotalFileSize(currentTotalSize, newFilesTotalSize);
        
        // Upload từng file
        List<Attachment> newAttachments = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                Attachment attachment = fileStorageService.uploadFile(file, authorId);
                newAttachments.add(attachment);
            } catch (Exception e) {
                // Rollback: xóa các file đã upload thành công
                for (Attachment uploaded : newAttachments) {
                    fileStorageService.deleteFile(uploaded.getFileUrl());
                }
                throw new RuntimeException("Lỗi upload file: " + e.getMessage(), e);
            }
        }
        
        // Thêm attachments vào note
        note.getAttachments().addAll(newAttachments);
        note.setUpdatedAt(LocalDateTime.now());
        
        return noteRepository.save(note);
    }
    
    /**
     * GĐ7: Xóa file khỏi note
     */
    public Note deleteFileFromNote(String noteId, String authorId, String fileName) {
        // Tìm note
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        // Kiểm tra quyền
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền xóa file trong note này");
        }
        
        // Tìm và xóa attachment
        Iterator<Attachment> iterator = note.getAttachments().iterator();
        boolean found = false;
        
        while (iterator.hasNext()) {
            Attachment attachment = iterator.next();
            if (attachment.getFileName().equals(fileName)) {
                // Xóa file khỏi storage
                fileStorageService.deleteFile(attachment.getFileUrl());
                
                // Xóa khỏi list
                iterator.remove();
                found = true;
                break;
            }
        }
        
        if (!found) {
            throw new RuntimeException("File không tồn tại trong note");
        }
        
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }
    
    /**
     * GĐ7: Lấy thông tin file của note
     */
    public List<Attachment> getNoteFiles(String noteId, String authorId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền xem file trong note này");
        }
        
        return note.getAttachments();
    }
    
    /**
     * GĐ7+: Lấy file để hiển thị (cho ảnh trong editor)
     */
    public byte[] getFileContent(String noteId, String authorId, String fileName) throws IOException {
        // Tìm note
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        // Kiểm tra quyền
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền xem file trong note này");
        }
        
        // Tìm attachment
        Attachment attachment = note.getAttachments().stream()
                .filter(att -> att.getFileName().equals(fileName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("File không tồn tại"));
        
        // Đọc file từ storage
        return fileStorageService.readFileContent(attachment.getFileUrl());
    }
    
    /**
     * GĐ7+: Lấy thông tin file (content type, etc.)
     */
    public Attachment getFileInfo(String noteId, String authorId, String fileName) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền xem file trong note này");
        }
        
        return note.getAttachments().stream()
                .filter(att -> att.getFileName().equals(fileName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("File không tồn tại"));
    }
}
