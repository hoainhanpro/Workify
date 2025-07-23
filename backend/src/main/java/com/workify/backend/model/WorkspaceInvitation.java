package com.workify.backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;

/**
 * Model định nghĩa lời mời tham gia workspace
 */
@Document(collection = "workspace_invitations")
public class WorkspaceInvitation {

    @Id
    private String id;

    @NotBlank(message = "Workspace ID cannot be blank")
    private String workspaceId;

    @NotBlank(message = "Inviter user ID cannot be blank")
    private String inviterUserId; // User gửi lời mời

    private String invitedEmail; // Email được mời (có thể null nếu mời bằng username)
    private String invitedUsername; // Username được mời (có thể null nếu mời bằng email)
    private String invitedUserId; // ID của user được mời (nếu tìm thấy)

    private WorkspaceRole role; // Role sẽ được assign

    @Indexed(unique = true)
    private String token; // Unique token cho invitation

    private InvitationStatus status = InvitationStatus.PENDING;

    private LocalDateTime expiresAt; // Thời gian hết hạn

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime respondedAt; // Thời gian phản hồi

    // Constructors
    public WorkspaceInvitation() {
    }

    public WorkspaceInvitation(String workspaceId, String inviterUserId, String invitedEmail,
            String invitedUsername, WorkspaceRole role) {
        this.workspaceId = workspaceId;
        this.inviterUserId = inviterUserId;
        this.invitedEmail = invitedEmail;
        this.invitedUsername = invitedUsername;
        this.role = role;
        this.token = generateUniqueToken();
        this.status = InvitationStatus.PENDING;
        this.expiresAt = LocalDateTime.now().plusDays(7); // Hết hạn sau 7 ngày
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

    public String getInviterUserId() {
        return inviterUserId;
    }

    public void setInviterUserId(String inviterUserId) {
        this.inviterUserId = inviterUserId;
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
        if (status != InvitationStatus.PENDING && this.respondedAt == null) {
            this.respondedAt = LocalDateTime.now();
        }
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

    // Helper methods

    /**
     * Kiểm tra invitation có hết hạn không
     */
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    /**
     * Kiểm tra invitation có còn pending không
     */
    public boolean isPending() {
        return status == InvitationStatus.PENDING && !isExpired();
    }

    /**
     * Accept invitation
     */
    public void accept() {
        this.status = InvitationStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
    }

    /**
     * Decline invitation
     */
    public void decline() {
        this.status = InvitationStatus.DECLINED;
        this.respondedAt = LocalDateTime.now();
    }

    /**
     * Mark as expired
     */
    public void markAsExpired() {
        this.status = InvitationStatus.EXPIRED;
    }

    /**
     * Generate unique token cho invitation
     */
    private String generateUniqueToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * Public method để generate token
     */
    public String generateToken() {
        return generateUniqueToken();
    }

    @Override
    public String toString() {
        return "WorkspaceInvitation{" +
                "id='" + id + '\'' +
                ", workspaceId='" + workspaceId + '\'' +
                ", inviterUserId='" + inviterUserId + '\'' +
                ", invitedEmail='" + invitedEmail + '\'' +
                ", invitedUsername='" + invitedUsername + '\'' +
                ", invitedUserId='" + invitedUserId + '\'' +
                ", role=" + role +
                ", status=" + status +
                ", expiresAt=" + expiresAt +
                ", createdAt=" + createdAt +
                '}';
    }
}
