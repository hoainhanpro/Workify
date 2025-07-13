package com.workify.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleCallbackRequest {
    
    @NotBlank(message = "Authorization code cannot be blank")
    private String code;
    
    @NotBlank(message = "Redirect URI cannot be blank")
    private String redirectUri;
    
    private String state; // CSRF protection
    
    // Constructors
    public GoogleCallbackRequest() {}
    
    public GoogleCallbackRequest(String code, String redirectUri) {
        this.code = code;
        this.redirectUri = redirectUri;
    }
    
    // Getters and Setters
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getRedirectUri() {
        return redirectUri;
    }
    
    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
}
