package com.workify.backend.model;

/**
 * Enum định nghĩa trạng thái thành viên trong workspace
 */
public enum MemberStatus {
    PENDING, // Chờ xử lý invitation
    ACTIVE, // Đang hoạt động
    SUSPENDED // Bị tạm ngưng
}
