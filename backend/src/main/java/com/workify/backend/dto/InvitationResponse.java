package com.workify.backend.dto;

import com.workify.backend.model.InvitationStatus;
import com.workify.backend.model.WorkspaceInvitation;
import com.workify.backend.model.WorkspaceRole;

import java.time.LocalDateTime;

/**
 * DTO cho response invitation
 */
public class InvitationResponse {

    private String id;
    private String workspaceId;
    private String workspaceName; // Tên workspace để hiển thị
    private String inviterUserId;
    private String inviterUsername; // Username của người gửi lời mời
    private String invitedEmail;
    private String invitedUsername;
    private String invitedUserId;
    private WorkspaceRole role;
    private String token;
    private InvitationStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    // Constructors
    public InvitationResponse() {
    }

    public InvitationResponse(WorkspaceInvitation invitation) {
        this.id = invitation.getId();
        this.workspaceId = invitation.getWorkspaceId();
        this.inviterUserId = invitation.getInviterUserId();
        this.invitedEmail = invitation.getInvitedEmail();
        this.invitedUsername = invitation.getInvitedUsername();
        this.invitedUserId = invitation.getInvitedUserId();
        this.role = invitation.getRole();
        this.token = invitation.getToken();
        this.status = invitation.getStatus();
        this.expiresAt = invitation.getExpiresAt();
        this.createdAt = invitation.getCreatedAt();
        this.respondedAt = invitation.getRespondedAt();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getWorkspaceName() {
        return workspaceName;
    }

    public void setWorkspaceName(String workspaceName) {
        this.workspaceName = workspaceName;
    }

    public String getInviterUserId() {
        return inviterUserId;
    }

    public void setInviterUserId(String inviterUserId) {
        this.inviterUserId = inviterUserId;
    }

    public String getInviterUsername() {
        return inviterUsername;
    }

    public void setInviterUsername(String inviterUsername) {
        this.inviterUsername = inviterUsername;
    }

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

    public String getInvitedUserId() {
        return invitedUserId;
    }

    public void setInvitedUserId(String invitedUserId) {
        this.invitedUserId = invitedUserId;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }

    @Override
    public String toString() {
        return "InvitationResponse{" +
                "id='" + id + '\'' +
                ", workspaceId='" + workspaceId + '\'' +
                ", workspaceName='" + workspaceName + '\'' +
                ", inviterUserId='" + inviterUserId + '\'' +
                ", inviterUsername='" + inviterUsername + '\'' +
                ", invitedEmail='" + invitedEmail + '\'' +
                ", invitedUsername='" + invitedUsername + '\'' +
                ", role=" + role +
                ", status=" + status +
                ", expiresAt=" + expiresAt +
                ", createdAt=" + createdAt +
                '}';
    }
}
