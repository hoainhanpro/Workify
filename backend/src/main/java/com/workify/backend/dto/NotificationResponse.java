package com.workify.backend.dto;

import com.workify.backend.model.Notification;

import java.time.LocalDateTime;

public class NotificationResponse {

    private String id;
    private String userId;
    private String title;
    private String message;
    private Notification.NotificationType type;
    private String taskId;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    // Constructor từ Notification entity
    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.userId = notification.getUserId();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.type = notification.getType();
        this.taskId = notification.getTaskId();
        this.isRead = notification.isRead();
        this.createdAt = notification.getCreatedAt();
        this.readAt = notification.getReadAt();
    }

    // Default constructor
    public NotificationResponse() {
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

    public Notification.NotificationType getType() {
        return type;
    }

    public void setType(Notification.NotificationType type) {
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

    @Override
    public String toString() {
        return "NotificationResponse{" +
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
