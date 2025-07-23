package com.workify.backend.model;

/**
 * Enum định nghĩa các vai trò trong workspace
 * Thứ tự ưu tiên: OWNER > ADMIN > EDITOR > VIEWER
 */
public enum WorkspaceRole {
    OWNER, // Chủ sở hữu workspace - full quyền
    ADMIN, // Quản trị viên - quản lý members, không thể xóa workspace
    EDITOR, // Người chỉnh sửa - tạo/sửa tasks/notes
    VIEWER // Người xem - chỉ xem, không chỉnh sửa
}
