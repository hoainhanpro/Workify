package com.workify.backend.dto;

import com.workify.backend.model.WorkspaceRole;
import jakarta.validation.constraints.NotNull;

/**
 * DTO cho gửi lời mời workspace
 */
public class InvitationRequest {

    private String invitedEmail; // Email được mời (có thể null nếu dùng username)
    private String invitedUsername; // Username được mời (có thể null nếu dùng email)

    @NotNull(message = "Role cannot be null")
    private WorkspaceRole role;

    // Constructors
    public InvitationRequest() {
    }

    public InvitationRequest(String invitedEmail, String invitedUsername, WorkspaceRole role) {
        this.invitedEmail = invitedEmail;
        this.invitedUsername = invitedUsername;
        this.role = role;
    }

    // Getters and Setters
    public String getInvitedEmail() {
        return invitedEmail;
    }

    public void setInvitedEmail(String invitedEmail) {
        this.invitedEmail = invitedEmail;
    }

    public String getInvitedUsername() {
        return invitedUsername;
    }

    public void setInvitedUsername(String invitedUsername) {
        this.invitedUsername = invitedUsername;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }

    // Validation helper
    public boolean isValid() {
        return (invitedEmail != null && !invitedEmail.trim().isEmpty()) ||
                (invitedUsername != null && !invitedUsername.trim().isEmpty());
    }

    @Override
    public String toString() {
        return "InvitationRequest{" +
                "invitedEmail='" + invitedEmail + '\'' +
                ", invitedUsername='" + invitedUsername + '\'' +
                ", role=" + role +
                '}';
    }
}
