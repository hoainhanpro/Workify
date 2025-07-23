package com.workify.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;

/**
 * Model định nghĩa thành viên trong workspace (embedded trong Workspace)
 */
public class WorkspaceMember {

    private String userId; // ID của user
    private WorkspaceRole role; // Vai trò trong workspace
    private MemberStatus status; // Trạng thái thành viên

    @CreatedDate
    private LocalDateTime joinedAt; // Thời gian tham gia

    // Constructors
    public WorkspaceMember() {
    }

    public WorkspaceMember(String userId, WorkspaceRole role) {
        this.userId = userId;
        this.role = role;
        this.status = MemberStatus.ACTIVE;
        this.joinedAt = LocalDateTime.now();
    }

    public WorkspaceMember(String userId, WorkspaceRole role, MemberStatus status) {
        this.userId = userId;
        this.role = role;
        this.status = status;
        this.joinedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }

    public MemberStatus getStatus() {
        return status;
    }

    public void setStatus(MemberStatus status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    // Helper methods
    public boolean isActive() {
        return status == MemberStatus.ACTIVE;
    }

    public boolean isOwner() {
        return role == WorkspaceRole.OWNER;
    }

    public boolean isAdminOrOwner() {
        return role == WorkspaceRole.OWNER || role == WorkspaceRole.ADMIN;
    }

    public boolean canEdit() {
        return role == WorkspaceRole.OWNER ||
                role == WorkspaceRole.ADMIN ||
                role == WorkspaceRole.EDITOR;
    }

    public boolean canView() {
        return true; // Tất cả members đều có thể view
    }

    @Override
    public String toString() {
        return "WorkspaceMember{" +
                "userId='" + userId + '\'' +
                ", role=" + role +
                ", status=" + status +
                ", joinedAt=" + joinedAt +
                '}';
    }
}
