package com.workify.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.workify.backend.dto.NoteCreateRequest;
import com.workify.backend.dto.NoteResponse;
import com.workify.backend.dto.NoteUpdateRequest;
import com.workify.backend.dto.TagResponse;
import com.workify.backend.model.Note;
import com.workify.backend.repository.NoteRepository;

@Service
public class NoteService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private TagService tagService;
    
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
}
