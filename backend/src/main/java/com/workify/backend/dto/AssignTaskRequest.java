package com.workify.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignTaskRequest {

    @NotBlank(message = "Assignee user ID cannot be blank")
    private String assigneeUserId;

    private String message; // Tin nhắn gửi kèm khi assign (optional)
    private Boolean notifyAssignee = true; // Có thông báo cho assignee không

    public AssignTaskRequest() {
    }

    public AssignTaskRequest(String assigneeUserId) {
        this.assigneeUserId = assigneeUserId;
    }

    // Getters and Setters
    public String getAssigneeUserId() {
        return assigneeUserId;
    }

    public void setAssigneeUserId(String assigneeUserId) {
        this.assigneeUserId = assigneeUserId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getNotifyAssignee() {
        return notifyAssignee;
    }

    public void setNotifyAssignee(Boolean notifyAssignee) {
        this.notifyAssignee = notifyAssignee != null ? notifyAssignee : true;
    }
}
