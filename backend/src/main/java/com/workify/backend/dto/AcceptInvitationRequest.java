package com.workify.backend.dto;

/**
 * DTO cho accept invitation request
 */
public class AcceptInvitationRequest {

    private String token;

    // Constructors
    public AcceptInvitationRequest() {
    }

    public AcceptInvitationRequest(String token) {
        this.token = token;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    @Override
    public String toString() {
        return "AcceptInvitationRequest{" +
                "token='" + token + '\'' +
                '}';
    }
}
