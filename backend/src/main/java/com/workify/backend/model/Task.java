package com.workify.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Document(collection = "tasks")
public class Task {

    // SubTask inner class
    public static class SubTask {
        private String id;

        @NotBlank(message = "SubTask title cannot be blank")
        @Size(max = 200, message = "SubTask title cannot exceed 200 characters")
        private String title;

        @Size(max = 500, message = "SubTask description cannot exceed 500 characters")
        private String description;

        @NotNull(message = "SubTask status cannot be null")
        private TaskStatus status = TaskStatus.TODO;

        @NotNull(message = "SubTask priority cannot be null")
        private TaskPriority priority = TaskPriority.MEDIUM;

        @CreatedDate
        private LocalDateTime createdAt;

        @LastModifiedDate
        private LocalDateTime updatedAt;

        private LocalDateTime completedAt;

        private LocalDateTime dueDate;

        // SubTask Constructors
        public SubTask() {
        }

        public SubTask(String title, String description) {
            this.title = title;
            this.description = description;
            this.createdAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
        }

        // SubTask Getters and Setters
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

        public TaskStatus getStatus() {
            return status;
        }

        public void setStatus(TaskStatus status) {
            this.status = status;
            this.updatedAt = LocalDateTime.now();
            if (status == TaskStatus.COMPLETED && this.completedAt == null) {
                this.completedAt = LocalDateTime.now();
            } else if (status != TaskStatus.COMPLETED) {
                this.completedAt = null;
            }
        }

        public TaskPriority getPriority() {
            return priority;
        }

        public void setPriority(TaskPriority priority) {
            this.priority = priority;
            this.updatedAt = LocalDateTime.now();
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
            this.updatedAt = LocalDateTime.now();
        }

        // ============= SUBTASK BUSINESS LOGIC =============

        /**
         * Check if subtask is overdue
         */
        public boolean isOverdue() {
            return this.dueDate != null &&
                    this.dueDate.isBefore(LocalDateTime.now()) &&
                    this.status != TaskStatus.COMPLETED;
        }

        /**
         * Check if subtask is due soon (within next 24 hours)
         */
        public boolean isDueSoon() {
            return this.dueDate != null &&
                    this.dueDate.isAfter(LocalDateTime.now()) &&
                    this.dueDate.isBefore(LocalDateTime.now().plusDays(1)) &&
                    this.status != TaskStatus.COMPLETED;
        }

        /**
         * Validate due date is not in the past (for new subtasks)
         * Allow due dates up to 5 minutes in the past to handle timezone/clock
         * differences
         */
        public boolean isValidDueDate() {
            if (this.dueDate == null)
                return true;

            // Allow due dates up to 5 minutes in the past
            LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
            return this.dueDate.isAfter(fiveMinutesAgo);
        }
    }

    @Id
    private String id;

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Status cannot be null")
    private TaskStatus status = TaskStatus.TODO;

    @NotNull(message = "Priority cannot be null")
    private TaskPriority priority = TaskPriority.MEDIUM;

    @NotBlank(message = "User ID cannot be blank")
    private String userId;
    private List<String> tags;

    // SubTasks list
    private List<SubTask> subTasks = new ArrayList<>();

    // Calendar integration fields
    private LocalDateTime dueDate;
    private String googleCalendarEventId;
    private Boolean syncWithCalendar = false;

    // Workspace integration fields
    private String workspaceId; // null = personal task
    private String assignedToUserId; // null = unassigned, assignee trong workspace
    private Boolean isSharedToWorkspace = false; // task có được chia sẻ lên workspace không
    private SharedPermissions sharedPermissions; // quyền truy cập chi tiết

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    // Enums
    public enum TaskStatus {
        TODO, IN_PROGRESS, COMPLETED
    }

    public enum TaskPriority {
        LOW, MEDIUM, HIGH
    }

    // Constructors
    public Task() {
    }

    public Task(String title, String description, String userId) {
        this.title = title;
        this.description = description;
        this.userId = userId;
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

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
        if (status == TaskStatus.COMPLETED && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        } else if (status != TaskStatus.COMPLETED) {
            this.completedAt = null;
        }
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
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
    public List<SubTask> getSubTasks() {
        return subTasks;
    }

    public void setSubTasks(List<SubTask> subTasks) {
        this.subTasks = subTasks != null ? subTasks : new ArrayList<>();
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
        this.syncWithCalendar = syncWithCalendar != null ? syncWithCalendar : false;
    }

    // ============= BUSINESS LOGIC METHODS =============

    /**
     * Check if task is overdue
     */
    public boolean isOverdue() {
        return this.dueDate != null &&
                this.dueDate.isBefore(LocalDateTime.now()) &&
                this.status != TaskStatus.COMPLETED;
    }

    /**
     * Check if task is due soon (within next 24 hours)
     */
    public boolean isDueSoon() {
        return this.dueDate != null &&
                this.dueDate.isAfter(LocalDateTime.now()) &&
                this.dueDate.isBefore(LocalDateTime.now().plusDays(1)) &&
                this.status != TaskStatus.COMPLETED;
    }

    /**
     * Get completion percentage based on completed subtasks
     */
    public double getCompletionPercentage() {
        if (this.subTasks == null || this.subTasks.isEmpty()) {
            return this.status == TaskStatus.COMPLETED ? 100.0 : 0.0;
        }

        long completedSubTasks = this.subTasks.stream()
                .mapToLong(subTask -> subTask.getStatus() == TaskStatus.COMPLETED ? 1 : 0)
                .sum();

        double subTaskPercentage = (double) completedSubTasks / this.subTasks.size() * 100.0;

        // If main task is completed, return 100%
        if (this.status == TaskStatus.COMPLETED) {
            return 100.0;
        }

        return subTaskPercentage;
    }

    /**
     * Get total subtasks count
     */
    public int getSubTasksCount() {
        return this.subTasks != null ? this.subTasks.size() : 0;
    }

    /**
     * Get completed subtasks count
     */
    public int getCompletedSubTasksCount() {
        if (this.subTasks == null)
            return 0;
        return (int) this.subTasks.stream()
                .mapToLong(subTask -> subTask.getStatus() == TaskStatus.COMPLETED ? 1 : 0)
                .sum();
    }

    /**
     * Auto-update main task status based on subtasks
     */
    public void updateStatusFromSubTasks() {
        if (this.subTasks == null || this.subTasks.isEmpty()) {
            return; // No change if no subtasks
        }

        long totalSubTasks = this.subTasks.size();
        long completedSubTasks = this.subTasks.stream()
                .mapToLong(subTask -> subTask.getStatus() == TaskStatus.COMPLETED ? 1 : 0)
                .sum();
        long inProgressSubTasks = this.subTasks.stream()
                .mapToLong(subTask -> subTask.getStatus() == TaskStatus.IN_PROGRESS ? 1 : 0)
                .sum();

        // Auto-complete main task if all subtasks are completed
        if (completedSubTasks == totalSubTasks && this.status != TaskStatus.COMPLETED) {
            this.setStatus(TaskStatus.COMPLETED);
        }
        // Set to in-progress if any subtask is in progress
        else if (inProgressSubTasks > 0 && this.status == TaskStatus.TODO) {
            this.setStatus(TaskStatus.IN_PROGRESS);
        }
    }

    /**
     * Validate due date is not in the past (for new tasks)
     * Allow due dates up to 5 minutes in the past to handle timezone/clock
     * differences
     */
    public boolean isValidDueDate() {
        if (this.dueDate == null)
            return true;

        // Allow due dates up to 5 minutes in the past
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        return this.dueDate.isAfter(fiveMinutesAgo);
    }

    /**
     * Check if task needs calendar sync
     */
    public boolean needsCalendarSync() {
        return this.syncWithCalendar != null &&
                this.syncWithCalendar &&
                this.dueDate != null &&
                (this.googleCalendarEventId == null || this.googleCalendarEventId.isEmpty());
    }

    /**
     * Check if task has calendar integration
     */
    public boolean hasCalendarIntegration() {
        return this.googleCalendarEventId != null && !this.googleCalendarEventId.isEmpty();
    }

    // ============= WORKSPACE FIELDS GETTERS AND SETTERS =============

    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(String assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public Boolean getIsSharedToWorkspace() {
        return isSharedToWorkspace;
    }

    public void setIsSharedToWorkspace(Boolean isSharedToWorkspace) {
        this.isSharedToWorkspace = isSharedToWorkspace != null ? isSharedToWorkspace : false;
    }

    public SharedPermissions getSharedPermissions() {
        return sharedPermissions;
    }

    public void setSharedPermissions(SharedPermissions sharedPermissions) {
        this.sharedPermissions = sharedPermissions;
    }

    // ============= WORKSPACE HELPER METHODS =============

    /**
     * Kiểm tra task có phải là personal task không
     */
    public boolean isPersonalTask() {
        return workspaceId == null || workspaceId.isEmpty();
    }

    /**
     * Kiểm tra task có được chia sẻ lên workspace không
     */
    public boolean isSharedTask() {
        return isSharedToWorkspace != null && isSharedToWorkspace && workspaceId != null;
    }

    /**
     * Kiểm tra task có được assign cho ai không
     */
    public boolean isAssigned() {
        return assignedToUserId != null && !assignedToUserId.isEmpty();
    }

    /**
     * Kiểm tra user có quyền view task này không
     */
    public boolean canUserView(String userId) {
        // Owner của task luôn có quyền view
        if (this.userId.equals(userId)) {
            return true;
        }

        // Nếu là personal task, chỉ owner mới view được
        if (isPersonalTask()) {
            return false;
        }

        // Nếu là assigned task, assignee có thể view
        if (isAssigned() && assignedToUserId.equals(userId)) {
            return true;
        }

        // Kiểm tra shared permissions
        if (sharedPermissions != null) {
            return sharedPermissions.canUserView(userId);
        }

        return false;
    }

    /**
     * Kiểm tra user có quyền edit task này không
     */
    public boolean canUserEdit(String userId) {
        // Owner của task luôn có quyền edit
        if (this.userId.equals(userId)) {
            return true;
        }

        // Nếu là personal task, chỉ owner mới edit được
        if (isPersonalTask()) {
            return false;
        }

        // Nếu là assigned task, assignee có thể edit
        if (isAssigned() && assignedToUserId.equals(userId)) {
            return true;
        }

        // Kiểm tra shared permissions
        if (sharedPermissions != null) {
            return sharedPermissions.canUserEdit(userId);
        }

        return false;
    }

    /**
     * Share task to workspace với permissions mặc định
     */
    public void shareToWorkspace(String workspaceId) {
        this.workspaceId = workspaceId;
        this.isSharedToWorkspace = true;
        if (this.sharedPermissions == null) {
            this.sharedPermissions = new SharedPermissions();
        }
    }

    /**
     * Assign task cho user trong workspace
     */
    public void assignToUser(String userId) {
        this.assignedToUserId = userId;
        // Tự động cấp quyền edit cho assignee
        if (this.sharedPermissions == null) {
            this.sharedPermissions = new SharedPermissions();
        }
        this.sharedPermissions.addEditPermission(userId);
    }
}
