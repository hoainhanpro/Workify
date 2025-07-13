package com.workify.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.workify.backend.model.OAuthToken;

@Repository
public interface OAuthTokenRepository extends MongoRepository<OAuthToken, String> {
    
    /**
     * Tìm OAuth token theo userId và provider
     */
    Optional<OAuthToken> findByUserIdAndProvider(String userId, String provider);
    
    /**
     * Tìm tất cả OAuth tokens của một user
     */
    List<OAuthToken> findByUserId(String userId);
    
    /**
     * Tìm OAuth token theo provider
     */
    List<OAuthToken> findByProvider(String provider);
    
    /**
     * Xóa OAuth token theo userId và provider
     */
    void deleteByUserIdAndProvider(String userId, String provider);
    
    /**
     * Xóa tất cả OAuth tokens của một user
     */
    void deleteByUserId(String userId);
    
    /**
     * Kiểm tra xem user có OAuth token với provider nào đó không
     */
    boolean existsByUserIdAndProvider(String userId, String provider);
}
