package com.workify.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class UpdatePermissionsRequest {

    @NotNull(message = "View permissions cannot be null")
    private List<String> viewUserIds;

    @NotNull(message = "Edit permissions cannot be null")
    private List<String> editUserIds;

    private String reason; // Lý do thay đổi permissions (optional)

    public UpdatePermissionsRequest() {
    }

    public UpdatePermissionsRequest(List<String> viewUserIds, List<String> editUserIds) {
        this.viewUserIds = viewUserIds;
        this.editUserIds = editUserIds;
    }

    // Getters and Setters
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
