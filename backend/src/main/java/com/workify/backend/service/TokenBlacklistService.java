package com.workify.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.workify.backend.model.RevokedToken;
import com.workify.backend.repository.RevokedTokenRepository;

@Service
public class TokenBlacklistService {

    @Autowired
    private RevokedTokenRepository revokedTokenRepository;

    /**
     * Thu hồi token
     */
    public void revokeToken(String token, String userId, String reason) {
        String tokenHash = hashToken(token);
        
        // Kiểm tra token đã bị thu hồi chưa
        if (!revokedTokenRepository.existsByTokenHash(tokenHash)) {
            RevokedToken revokedToken = new RevokedToken(tokenHash, userId, reason);
            revokedTokenRepository.save(revokedToken);
        }
    }

    /**
     * Kiểm tra token có bị thu hồi không
     */
    public boolean isTokenRevoked(String token) {
        String tokenHash = hashToken(token);
        return revokedTokenRepository.existsByTokenHash(tokenHash);
    }

    /**
     * Thu hồi tất cả token của user
     */
    public void revokeAllTokensForUser(String userId, String reason) {
        // Trong implementation thực tế, chúng ta cần lưu trữ tất cả active tokens
        // Ở đây chỉ là placeholder cho business logic
        // TODO: Implement proper token tracking
    }

    /**
     * Lấy danh sách token đã thu hồi của user
     */
    public List<RevokedToken> getRevokedTokensForUser(String userId) {
        return revokedTokenRepository.findByUserId(userId);
    }

    /**
     * Lấy danh sách token đã thu hồi của user sau một thời điểm
     */
    public List<RevokedToken> getRevokedTokensForUserAfter(String userId, LocalDateTime after) {
        return revokedTokenRepository.findByUserIdAndRevokedAtAfter(userId, after);
    }

    /**
     * Hash token để bảo mật
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Dọn dẹp token đã hết hạn (chạy định kỳ)
     */
    @Scheduled(fixedRate = 3600000) // Chạy mỗi giờ
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        revokedTokenRepository.deleteByExpiresAtBefore(now);
    }

    /**
     * Đếm số token đã thu hồi của user
     */
    public long countRevokedTokensForUser(String userId) {
        return revokedTokenRepository.countByUserId(userId);
    }
}
