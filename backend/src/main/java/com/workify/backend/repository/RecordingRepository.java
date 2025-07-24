package com.workify.backend.repository;

import com.workify.backend.model.Recording;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordingRepository extends MongoRepository<Recording, String> {
    
    /**
     * Tìm các bản ghi theo userId và sắp xếp theo ngày giảm dần
     */
    List<Recording> findByUserIdOrderByRecordingDateDesc(String userId);
    
    /**
     * Tìm các bản ghi theo userId và trạng thái xử lý
     */
    List<Recording> findByUserIdAndProcessingStatus(String userId, String processingStatus);
    
    /**
     * Đếm số lượng bản ghi theo userId
     */
    long countByUserId(String userId);
    
    /**
     * Tìm các bản ghi theo tag IDs
     */
    @Query("{ 'userId': ?0, 'tagIds': { $in: ?1 } }")
    List<Recording> findByUserIdAndTagIdsIn(String userId, List<String> tagIds);
}
