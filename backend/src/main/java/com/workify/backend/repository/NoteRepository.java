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
    
    // GĐ5: Tìm note được pin của user
    List<Note> findByAuthorIdAndIsPinnedTrueOrderByCreatedAtDesc(String authorId);
    
    // GĐ6: Tìm note theo tagId
    List<Note> findByAuthorIdAndTagIdsContainingOrderByCreatedAtDesc(String authorId, String tagId);
    
    // GĐ6: Tìm note theo nhiều tagIds
    List<Note> findByAuthorIdAndTagIdsInOrderByCreatedAtDesc(String authorId, List<String> tagIds);
    
    // GĐ6: Tìm kiếm note theo keyword trong title hoặc content
    List<Note> findByAuthorIdAndTitleContainingIgnoreCaseOrAuthorIdAndContentContainingIgnoreCaseOrderByCreatedAtDesc(
        String authorId1, String titleKeyword, String authorId2, String contentKeyword);
    
    // GĐ6: Tìm kiếm note theo nhiều điều kiện (title, content, tags)
    List<Note> findByAuthorIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(String authorId, String keyword);
}
