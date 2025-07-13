package com.workify.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.workify.backend.model.Tag;

/**
 * Tag Repository - Xử lý truy vấn MongoDB cho Tag collection
 */
@Repository
public interface TagRepository extends MongoRepository<Tag, String> {
    
    // Tìm tất cả tags của một user
    List<Tag> findByAuthorIdOrderByNameAsc(String authorId);
    
    // Tìm tag theo tên và authorId (để check unique)
    Optional<Tag> findByNameAndAuthorId(String name, String authorId);
    
    // Tìm tags theo màu sắc
    List<Tag> findByAuthorIdAndColorOrderByNameAsc(String authorId, String color);
    
    // Tìm tag theo tên (case insensitive)
    List<Tag> findByAuthorIdAndNameContainingIgnoreCaseOrderByNameAsc(String authorId, String name);
    
    // Đếm số lượng tags của user
    long countByAuthorId(String authorId);
    
    // Xóa tất cả tags của user
    void deleteByAuthorId(String authorId);
}
