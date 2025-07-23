package com.workify.backend.dto;

import com.workify.backend.model.MemberStatus;
import com.workify.backend.model.WorkspaceMember;
import com.workify.backend.model.WorkspaceRole;

import java.time.LocalDateTime;

/**
 * DTO cho response member của workspace
 */
public class WorkspaceMemberResponse {

    private String userId;
    private String username; // Username của member
    private String fullName; // Full name của member
    private String email; // Email của member
    private String profilePicture; // Ảnh đại diện của member
    private WorkspaceRole role;
    private MemberStatus status;
    private LocalDateTime joinedAt;

    // Constructors
    public WorkspaceMemberResponse() {
    }

    public WorkspaceMemberResponse(WorkspaceMember member) {
        this.userId = member.getUserId();
        this.role = member.getRole();
        this.status = member.getStatus();
        this.joinedAt = member.getJoinedAt();
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
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

    @Override
    public String toString() {
        return "WorkspaceMemberResponse{" +
                "userId='" + userId + '\'' +
                ", username='" + username + '\'' +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", status=" + status +
                ", joinedAt=" + joinedAt +
                '}';
    }
}
