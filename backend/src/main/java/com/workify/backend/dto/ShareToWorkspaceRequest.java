package com.workify.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class ShareToWorkspaceRequest {

    @NotBlank(message = "Workspace ID cannot be blank")
    private String workspaceId;

    private List<String> viewUserIds; // Danh sách user có quyền view
    private List<String> editUserIds; // Danh sách user có quyền edit

    private Boolean shareToAllMembers = false; // Chia sẻ cho tất cả members
    private String defaultPermission = "view"; // "view" hoặc "edit"

    public ShareToWorkspaceRequest() {
    }

    public ShareToWorkspaceRequest(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    // Getters and Setters
    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    public List<String> getViewUserIds() {
        return viewUserIds;
    }

    public void setViewUserIds(List<String> viewUserIds) {
        this.viewUserIds = viewUserIds;
    }

    public List<String> getEditUserIds() {
        return editUserIds;
    }

    public void setEditUserIds(List<String> editUserIds) {
        this.editUserIds = editUserIds;
    }

    public Boolean getShareToAllMembers() {
        return shareToAllMembers;
    }

    public void setShareToAllMembers(Boolean shareToAllMembers) {
        this.shareToAllMembers = shareToAllMembers != null ? shareToAllMembers : false;
    }

    public String getDefaultPermission() {
        return defaultPermission;
    }

    public void setDefaultPermission(String defaultPermission) {
        this.defaultPermission = defaultPermission;
    }
}
