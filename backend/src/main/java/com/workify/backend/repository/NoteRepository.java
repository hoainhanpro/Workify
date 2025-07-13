package com.workify.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.workify.backend.model.Note;

@Repository
public interface NoteRepository extends MongoRepository<Note, String> {
    
    // Tìm note theo authorId
    List<Note> findByAuthorId(String authorId);
    
    // Tìm note theo authorId và sắp xếp theo thời gian tạo (mới nhất trước)
    List<Note> findByAuthorIdOrderByCreatedAtDesc(String authorId);
    
    // Tìm note theo title chứa keyword
    List<Note> findByAuthorIdAndTitleContainingIgnoreCase(String authorId, String keyword);
    
    // Đếm số lượng note của user
    long countByAuthorId(String authorId);
}
