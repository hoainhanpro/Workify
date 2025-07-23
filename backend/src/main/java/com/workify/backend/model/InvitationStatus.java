package com.workify.backend.model;

/**
 * Enum định nghĩa trạng thái lời mời workspace
 */
public enum InvitationStatus {
    PENDING, // Chờ phản hồi
    ACCEPTED, // Đã chấp nhận
    DECLINED, // Đã từ chối
    EXPIRED // Đã hết hạn
}
