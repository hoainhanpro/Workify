package com.workify.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;

@Document(collection = "oauth_tokens")
public class OAuthToken {

    @Id
    private String id;

    @NotBlank(message = "User ID cannot be blank")
    @Indexed
    private String userId; // Liên kết với User._id

    @NotBlank(message = "Provider cannot be blank")
    private String provider; // GOOGLE, FACEBOOK, etc.

    private String refreshToken; // Google refresh token (bắt buộc lưu để có thể refresh)

    private LocalDateTime expiresAt; // Thời điểm hết hạn refresh token

    private String scope; // "openid email profile" hoặc thêm "drive"

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public OAuthToken() {}

    public OAuthToken(String userId, String provider, String refreshToken, String scope) {
        this.userId = userId;
        this.provider = provider;
        this.refreshToken = refreshToken;
        this.scope = scope;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "OAuthToken{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", provider='" + provider + '\'' +
                ", scope='" + scope + '\'' +
                ", expiresAt=" + expiresAt +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
