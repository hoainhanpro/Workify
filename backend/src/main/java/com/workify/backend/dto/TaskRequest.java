package com.workify.backend.dto;

import com.workify.backend.model.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class TaskRequest {

    // SubTaskRequest inner class
    public static class SubTaskRequest {
        @NotBlank(message = "SubTask title cannot be blank")
        @Size(max = 200, message = "SubTask title cannot exceed 200 characters")
        private String title;

        @Size(max = 500, message = "SubTask description cannot exceed 500 characters")
        private String description;

        private Task.TaskStatus status = Task.TaskStatus.TODO;
        private Task.TaskPriority priority = Task.TaskPriority.MEDIUM;
        private LocalDateTime dueDate;

        // SubTaskRequest Constructors
        public SubTaskRequest() {
        }

        public SubTaskRequest(String title, String description, Task.TaskStatus status, Task.TaskPriority priority) {
            this.title = title;
            this.description = description;
            this.status = status;
            this.priority = priority;
        }

        // SubTaskRequest Getters and Setters
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

        public LocalDateTime getDueDate() {
            return dueDate;
        }

        public void setDueDate(LocalDateTime dueDate) {
            this.dueDate = dueDate;
        }
    }

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Status cannot be null")
    private Task.TaskStatus status;

    @NotNull(message = "Priority cannot be null")
    private Task.TaskPriority priority;

    private List<String> tags;

    // SubTasks
    private List<SubTaskRequest> subTasks;

    // Calendar integration
    private LocalDateTime dueDate;
    private Boolean syncWithCalendar; // Constructors

    public TaskRequest() {
    }

    public TaskRequest(String title, String description, Task.TaskStatus status, Task.TaskPriority priority,
            List<String> tags) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.tags = tags;
    }

    // Full constructor with SubTasks and Calendar
    public TaskRequest(String title, String description, Task.TaskStatus status, Task.TaskPriority priority,
            List<String> tags, List<SubTaskRequest> subTasks, LocalDateTime dueDate, Boolean syncWithCalendar) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.tags = tags;
        this.subTasks = subTasks;
        this.dueDate = dueDate;
        this.syncWithCalendar = syncWithCalendar;
    }

    // Getters and Setters
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

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    // SubTasks getters and setters
    public List<SubTaskRequest> getSubTasks() {
        return subTasks;
    }

    public void setSubTasks(List<SubTaskRequest> subTasks) {
        this.subTasks = subTasks;
    }

    // Calendar integration getters and setters
    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public Boolean getSyncWithCalendar() {
        return syncWithCalendar;
    }

    public void setSyncWithCalendar(Boolean syncWithCalendar) {
        this.syncWithCalendar = syncWithCalendar;
    }
}
