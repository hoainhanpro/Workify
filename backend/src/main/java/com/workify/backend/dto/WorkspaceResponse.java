package com.workify.backend.dto;

import com.workify.backend.model.Workspace;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho response workspace
 */
public class WorkspaceResponse {

    private String id;
    private String name;
    private String description;
    private String ownerId;
    private String ownerUsername; // Username của owner
    private String ownerFullName; // Full name của owner
    private List<WorkspaceMemberResponse> members;
    private int memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User permissions trong workspace này
    private String userRole; // Role của current user
    private boolean canEdit; // User có thể edit workspace không
    private boolean canInvite; // User có thể invite members không
    private boolean isOwner; // User có phải owner không

    // Constructors
    public WorkspaceResponse() {
    }

    public WorkspaceResponse(Workspace workspace) {
        this.id = workspace.getId();
        this.name = workspace.getName();
        this.description = workspace.getDescription();
        this.ownerId = workspace.getOwnerId();
        this.memberCount = workspace.getMemberCount();
        this.createdAt = workspace.getCreatedAt();
        this.updatedAt = workspace.getUpdatedAt();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public String getOwnerFullName() {
        return ownerFullName;
    }

    public void setOwnerFullName(String ownerFullName) {
        this.ownerFullName = ownerFullName;
    }

    public List<WorkspaceMemberResponse> getMembers() {
        return members;
    }

    public void setMembers(List<WorkspaceMemberResponse> members) {
        this.members = members;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
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

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public boolean isCanEdit() {
        return canEdit;
    }

    public void setCanEdit(boolean canEdit) {
        this.canEdit = canEdit;
    }

    public boolean isCanInvite() {
        return canInvite;
    }

    public void setCanInvite(boolean canInvite) {
        this.canInvite = canInvite;
    }

    public boolean isOwner() {
        return isOwner;
    }

    public void setOwner(boolean owner) {
        isOwner = owner;
    }

    @Override
    public String toString() {
        return "WorkspaceResponse{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", ownerId='" + ownerId + '\'' +
                ", ownerUsername='" + ownerUsername + '\'' +
                ", memberCount=" + memberCount +
                ", userRole='" + userRole + '\'' +
                ", canEdit=" + canEdit +
                ", isOwner=" + isOwner +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
