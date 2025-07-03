package com.workify.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "revoked_tokens")
public class RevokedToken {

    @Id
    private String id;

    @Indexed(unique = true)
    private String tokenHash; // Hash của token để bảo mật

    private String userId;

    private LocalDateTime revokedAt;

    @Field
    @Indexed
    private LocalDateTime expiresAt; // Token sẽ được xóa sau 7 ngày

    private String reason; // Lý do thu hồi token

    // Constructors
    public RevokedToken() {}

    public RevokedToken(String tokenHash, String userId, String reason) {
        this.tokenHash = tokenHash;
        this.userId = userId;
        this.reason = reason;
        this.revokedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(7);
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
