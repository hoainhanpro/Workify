package com.workify.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.workify.backend.model.RevokedToken;

@Repository
public interface RevokedTokenRepository extends MongoRepository<RevokedToken, String> {

    // Tìm token đã bị thu hồi bằng hash
    Optional<RevokedToken> findByTokenHash(String tokenHash);

    // Kiểm tra token có bị thu hồi không
    boolean existsByTokenHash(String tokenHash);

    // Tìm tất cả token đã thu hồi của user
    List<RevokedToken> findByUserId(String userId);

    // Tìm token đã thu hồi theo user và thời gian
    List<RevokedToken> findByUserIdAndRevokedAtAfter(String userId, LocalDateTime after);

    // Xóa token đã hết hạn
    void deleteByExpiresAtBefore(LocalDateTime now);

    // Đếm số token đã thu hồi của user
    long countByUserId(String userId);
}
