package com.workify.backend.dto;

import com.workify.backend.model.Task;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class TaskResponse {

    // SubTaskResponse inner class
    public static class SubTaskResponse {
        private String id;
        private String title;
        private String description;
        private Task.TaskStatus status;
        private Task.TaskPriority priority;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime completedAt;
        private LocalDateTime dueDate;

        // SubTaskResponse Constructors
        public SubTaskResponse() {
        }

        public SubTaskResponse(Task.SubTask subTask) {
            this.id = subTask.getId() != null ? subTask.getId() : UUID.randomUUID().toString();
            this.title = subTask.getTitle();
            this.description = subTask.getDescription();
            this.status = subTask.getStatus();
            this.priority = subTask.getPriority();
            this.createdAt = subTask.getCreatedAt();
            this.updatedAt = subTask.getUpdatedAt();
            this.completedAt = subTask.getCompletedAt();
            this.dueDate = subTask.getDueDate();
        }

        // SubTaskResponse Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Task.TaskStatus getStatus() {
            return status;
        }

        public void setStatus(Task.TaskStatus status) {
            this.status = status;
        }

        public Task.TaskPriority getPriority() {
            return priority;
        }

        public void setPriority(Task.TaskPriority priority) {
            this.priority = priority;
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

        public LocalDateTime getCompletedAt() {
            return completedAt;
        }

        public void setCompletedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
        }

        public LocalDateTime getDueDate() {
            return dueDate;
        }

        public void setDueDate(LocalDateTime dueDate) {
            this.dueDate = dueDate;
        }
    }

    private String id;
    private String title;
    private String description;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private String userId;
    private List<String> tags;
    private List<SubTaskResponse> subTasks;
    private LocalDateTime dueDate;
    private String googleCalendarEventId;
    private Boolean syncWithCalendar;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    // Workspace integration fields
    private String workspaceId; // ID của workspace (null = personal task)
    private String workspaceName; // Tên workspace để hiển thị
    private String assignedToUserId; // ID của user được assign
    private String assignedToUsername; // Username của user được assign
    private String assignedToFullName; // Full name của user được assign
    private Boolean isSharedToWorkspace = false; // task có được chia sẻ lên workspace không

    // Constructors
    public TaskResponse() {
    }

    public TaskResponse(Task task) {
        this.id = task.getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.priority = task.getPriority();
        this.userId = task.getUserId();
        this.tags = task.getTags();
        this.createdAt = task.getCreatedAt();
        this.updatedAt = task.getUpdatedAt();
        this.completedAt = task.getCompletedAt();

        // Convert SubTasks
        if (task.getSubTasks() != null) {
            this.subTasks = task.getSubTasks().stream()
                    .map(SubTaskResponse::new)
                    .collect(java.util.stream.Collectors.toList());
        }

        // Calendar integration fields
        this.dueDate = task.getDueDate();
        this.googleCalendarEventId = task.getGoogleCalendarEventId();
        this.syncWithCalendar = task.getSyncWithCalendar();

        // Workspace integration fields
        this.workspaceId = task.getWorkspaceId();
        this.assignedToUserId = task.getAssignedToUserId();
        this.isSharedToWorkspace = task.getIsSharedToWorkspace();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Task.TaskStatus getStatus() {
        return status;
    }

    public void setStatus(Task.TaskStatus status) {
        this.status = status;
    }

    public Task.TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(Task.TaskPriority priority) {
        this.priority = priority;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
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

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    // SubTasks getters and setters
    public List<SubTaskResponse> getSubTasks() {
        return subTasks;
    }

    public void setSubTasks(List<SubTaskResponse> subTasks) {
        this.subTasks = subTasks;
    }

    // Calendar integration getters and setters
    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public String getGoogleCalendarEventId() {
        return googleCalendarEventId;
    }

    public void setGoogleCalendarEventId(String googleCalendarEventId) {
        this.googleCalendarEventId = googleCalendarEventId;
    }

    public Boolean getSyncWithCalendar() {
        return syncWithCalendar;
    }

    public void setSyncWithCalendar(Boolean syncWithCalendar) {
        this.syncWithCalendar = syncWithCalendar;
    }

    // Workspace fields getters and setters
    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getWorkspaceName() {
        return workspaceName;
    }

    public void setWorkspaceName(String workspaceName) {
        this.workspaceName = workspaceName;
    }

    public String getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(String assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public String getAssignedToUsername() {
        return assignedToUsername;
    }

    public void setAssignedToUsername(String assignedToUsername) {
        this.assignedToUsername = assignedToUsername;
    }

    public String getAssignedToFullName() {
        return assignedToFullName;
    }

    public void setAssignedToFullName(String assignedToFullName) {
        this.assignedToFullName = assignedToFullName;
    }

    public Boolean getIsSharedToWorkspace() {
        return isSharedToWorkspace;
    }

    public void setIsSharedToWorkspace(Boolean isSharedToWorkspace) {
        this.isSharedToWorkspace = isSharedToWorkspace;
    }
}
