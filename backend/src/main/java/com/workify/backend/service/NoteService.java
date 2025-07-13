package com.workify.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.workify.backend.dto.NoteCreateRequest;
import com.workify.backend.dto.NoteResponse;
import com.workify.backend.dto.NoteUpdateRequest;
import com.workify.backend.model.Note;
import com.workify.backend.repository.NoteRepository;

@Service
public class NoteService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    /**
     * Tạo note mới
     */
    public NoteResponse createNote(NoteCreateRequest request, String authorId) {
        Note note = new Note(request.getTitle(), request.getContent(), authorId);
        Note savedNote = noteRepository.save(note);
        return new NoteResponse(savedNote);
    }
    
    /**
     * Lấy tất cả note của user
     */
    public List<NoteResponse> getAllNotesByUser(String authorId) {
        List<Note> notes = noteRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
        return notes.stream()
                .map(NoteResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy note theo ID
     */
    public Optional<NoteResponse> getNoteById(String noteId, String authorId) {
        Optional<Note> note = noteRepository.findById(noteId);
        
        if (note.isPresent() && note.get().getAuthorId().equals(authorId)) {
            return Optional.of(new NoteResponse(note.get()));
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
        
        Note updatedNote = noteRepository.save(note);
        return Optional.of(new NoteResponse(updatedNote));
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
}
