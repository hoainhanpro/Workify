package com.workify.backend.dto;

public class GoogleOAuthResponse {
    
    private String accessToken;        // JWT nội bộ
    private String refreshToken;       // JWT nội bộ
    private String googleAccessToken;  // Google access token (tạm thời)
    private UserResponse user;
    private boolean isNewUser;
    private long expiresIn;           // Thời gian hết hạn JWT (giây)
    
    // Constructors
    public GoogleOAuthResponse() {}
    
    public GoogleOAuthResponse(String accessToken, String refreshToken, UserResponse user, boolean isNewUser) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
        this.isNewUser = isNewUser;
    }
    
    // Getters and Setters
    public String getAccessToken() {
        return accessToken;
    }
    
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public String getGoogleAccessToken() {
        return googleAccessToken;
    }
    
    public void setGoogleAccessToken(String googleAccessToken) {
        this.googleAccessToken = googleAccessToken;
    }
    
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
    
    public boolean isNewUser() {
        return isNewUser;
    }
    
    public void setNewUser(boolean newUser) {
        isNewUser = newUser;
    }
    
    public long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
