package com.workify.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Model định nghĩa Workspace - không gian làm việc nhóm
 */
@Document(collection = "workspaces")
public class Workspace {

    @Id
    private String id;

    @NotBlank(message = "Workspace name cannot be blank")
    @Size(max = 100, message = "Workspace name cannot exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Workspace description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Owner ID cannot be blank")
    private String ownerId; // User tạo workspace

    private List<WorkspaceMember> members = new ArrayList<>(); // Danh sách thành viên

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public Workspace() {
    }

    public Workspace(String name, String description, String ownerId) {
        this.name = name;
        this.description = description;
        this.ownerId = ownerId;
        this.members = new ArrayList<>();

        // Tự động thêm owner vào danh sách members
        this.members.add(new WorkspaceMember(ownerId, WorkspaceRole.OWNER));
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

    public List<WorkspaceMember> getMembers() {
        return members;
    }

    public void setMembers(List<WorkspaceMember> members) {
        this.members = members != null ? members : new ArrayList<>();
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

    // Helper methods

    /**
     * Thêm member mới vào workspace
     */
    public void addMember(String userId, WorkspaceRole role) {
        // Kiểm tra xem user đã là member chưa
        if (findMemberByUserId(userId).isEmpty()) {
            members.add(new WorkspaceMember(userId, role));
        }
    }

    /**
     * Tìm member theo userId
     */
    public Optional<WorkspaceMember> findMemberByUserId(String userId) {
        return members.stream()
                .filter(member -> member.getUserId().equals(userId))
                .findFirst();
    }

    /**
     * Xóa member khỏi workspace
     */
    public boolean removeMember(String userId) {
        return members.removeIf(member -> member.getUserId().equals(userId));
    }

    /**
     * Cập nhật role của member
     */
    public boolean updateMemberRole(String userId, WorkspaceRole newRole) {
        Optional<WorkspaceMember> memberOpt = findMemberByUserId(userId);
        if (memberOpt.isPresent()) {
            memberOpt.get().setRole(newRole);
            return true;
        }
        return false;
    }

    /**
     * Kiểm tra user có phải là owner không
     */
    public boolean isOwner(String userId) {
        return ownerId.equals(userId);
    }

    /**
     * Kiểm tra user có là member không
     */
    public boolean isMember(String userId) {
        return findMemberByUserId(userId).isPresent();
    }

    /**
     * Kiểm tra user có quyền admin không (OWNER hoặc ADMIN)
     */
    public boolean hasAdminRole(String userId) {
        Optional<WorkspaceMember> memberOpt = findMemberByUserId(userId);
        return memberOpt.isPresent() && memberOpt.get().isAdminOrOwner();
    }

    /**
     * Kiểm tra user có quyền edit không
     */
    public boolean canUserEdit(String userId) {
        Optional<WorkspaceMember> memberOpt = findMemberByUserId(userId);
        return memberOpt.isPresent() && memberOpt.get().canEdit() && memberOpt.get().isActive();
    }

    /**
     * Kiểm tra user có quyền view không
     */
    public boolean canUserView(String userId) {
        Optional<WorkspaceMember> memberOpt = findMemberByUserId(userId);
        return memberOpt.isPresent() && memberOpt.get().canView() && memberOpt.get().isActive();
    }

    /**
     * Lấy danh sách active members
     */
    public List<WorkspaceMember> getActiveMembers() {
        return members.stream()
                .filter(WorkspaceMember::isActive)
                .toList();
    }

    /**
     * Đếm số lượng members
     */
    public int getMemberCount() {
        return (int) members.stream()
                .filter(WorkspaceMember::isActive)
                .count();
    }

    @Override
    public String toString() {
        return "Workspace{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", ownerId='" + ownerId + '\'' +
                ", memberCount=" + getMemberCount() +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
