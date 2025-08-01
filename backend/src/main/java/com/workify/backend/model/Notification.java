package com.workify.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @NotBlank(message = "User ID cannot be blank")
    private String userId;

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Message cannot be blank")
    private String message;

    @NotNull(message = "Type cannot be null")
    private NotificationType type;

    private String taskId; // Task liên quan đến thông báo
    
    private boolean isRead = false;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    // Enums
    public enum NotificationType {
        TASK_DUE_SOON,      // Task sắp đến hạn
        TASK_OVERDUE,       // Task quá hạn
        TASK_ASSIGNED,      // Task được assign
        WORKSPACE_INVITATION, // Lời mời workspace
        GENERAL             // Thông báo chung
    }

    // Constructors
    public Notification() {
    }

    public Notification(String userId, String title, String message, NotificationType type) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String userId, String title, String message, NotificationType type, String taskId) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.taskId = taskId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
        if (read && this.readAt == null) {
            this.readAt = LocalDateTime.now();
        } else if (!read) {
            this.readAt = null;
        }
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    // Business methods
    public void markAsRead() {
        this.setRead(true);
    }

    public void markAsUnread() {
        this.setRead(false);
    }

    @Override
    public String toString() {
        return "Notification{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", title='" + title + '\'' +
                ", message='" + message + '\'' +
                ", type=" + type +
                ", taskId='" + taskId + '\'' +
                ", isRead=" + isRead +
                ", createdAt=" + createdAt +
                ", readAt=" + readAt +
                '}';
    }
}
