package com.workify.backend.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Model định nghĩa quyền chia sẻ cho Task/Note trong workspace
 */
public class SharedPermissions {

    private List<String> canView = new ArrayList<>(); // userIds có thể xem
    private List<String> canEdit = new ArrayList<>(); // userIds có thể chỉnh sửa

    // Constructors
    public SharedPermissions() {
    }

    public SharedPermissions(List<String> canView, List<String> canEdit) {
        this.canView = canView != null ? canView : new ArrayList<>();
        this.canEdit = canEdit != null ? canEdit : new ArrayList<>();
    }

    // Getters and Setters
    public List<String> getCanView() {
        return canView;
    }

    public void setCanView(List<String> canView) {
        this.canView = canView != null ? canView : new ArrayList<>();
    }

    public List<String> getCanEdit() {
        return canEdit;
    }

    public void setCanEdit(List<String> canEdit) {
        this.canEdit = canEdit != null ? canEdit : new ArrayList<>();
    }

    // Helper methods
    public boolean canUserView(String userId) {
        return canView.contains(userId);
    }

    public boolean canUserEdit(String userId) {
        return canEdit.contains(userId);
    }

    public void addViewPermission(String userId) {
        if (!canView.contains(userId)) {
            canView.add(userId);
        }
    }

    public void addEditPermission(String userId) {
        if (!canEdit.contains(userId)) {
            canEdit.add(userId);
        }
        // Nếu có quyền edit thì tự động có quyền view
        addViewPermission(userId);
    }

    public void removeViewPermission(String userId) {
        canView.remove(userId);
    }

    public void removeEditPermission(String userId) {
        canEdit.remove(userId);
    }

    @Override
    public String toString() {
        return "SharedPermissions{" +
                "canView=" + canView +
                ", canEdit=" + canEdit +
                '}';
    }
}
