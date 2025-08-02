package com.workify.backend.dto;

import com.workify.backend.model.Task;
import com.workify.backend.model.SharedPermissions;
import java.time.LocalDateTime;
import java.util.List;

public class WorkspaceTaskResponse {

    private String id;
    private String title;
    private String description;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private String userId; // Owner của task
    private String userEmail; // Email của owner
    private String userName; // Tên của owner

    // Workspace specific fields
    private String workspaceId;
    private String assignedToUserId;
    private String assignedToUserEmail;
    private String assignedToUserName;
    private Boolean isSharedToWorkspace;
    private SharedPermissions sharedPermissions;

    // Permission fields for current user
    private Boolean canView;
    private Boolean canEdit;
    private Boolean canDelete;
    private Boolean canAssign;

    // Task metrics
    private Integer subTasksCount;
    private Integer completedSubTasksCount;
    private Double completionPercentage;
    private List<Task.SubTask> subTasks; // Add subtasks list

    private List<String> tags;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    // Status flags
    private Boolean isOverdue;
    private Boolean isDueSoon;
    private Boolean isAssigned;

    public WorkspaceTaskResponse() {
    }

    public WorkspaceTaskResponse(Task task, String currentUserId) {
        this.id = task.getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.priority = task.getPriority();
        this.userId = task.getUserId();

        // Workspace fields
        this.workspaceId = task.getWorkspaceId();
        this.assignedToUserId = task.getAssignedToUserId();
        this.isSharedToWorkspace = task.getIsSharedToWorkspace();
        this.sharedPermissions = task.getSharedPermissions();

        // Permission checks
        this.canView = task.canUserView(currentUserId);
        this.canEdit = task.canUserEdit(currentUserId);
        this.canDelete = task.getUserId().equals(currentUserId); // Chỉ owner mới delete được
        this.canAssign = task.canUserEdit(currentUserId); // User có edit permission có thể assign

        // Task metrics
        this.subTasksCount = task.getSubTasksCount();
        this.completedSubTasksCount = task.getCompletedSubTasksCount();
        this.completionPercentage = task.getCompletionPercentage();
        this.subTasks = task.getSubTasks(); // Add subtasks

        this.tags = task.getTags();
        this.dueDate = task.getDueDate();
        this.createdAt = task.getCreatedAt();
        this.updatedAt = task.getUpdatedAt();
        this.completedAt = task.getCompletedAt();

        // Status flags
        this.isOverdue = task.isOverdue();
        this.isDueSoon = task.isDueSoon();
        this.isAssigned = task.isAssigned();
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

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

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

    public String getAssignedToUserEmail() {
        return assignedToUserEmail;
    }

    public void setAssignedToUserEmail(String assignedToUserEmail) {
        this.assignedToUserEmail = assignedToUserEmail;
    }

    public String getAssignedToUserName() {
        return assignedToUserName;
    }

    public void setAssignedToUserName(String assignedToUserName) {
        this.assignedToUserName = assignedToUserName;
    }

    public Boolean getIsSharedToWorkspace() {
        return isSharedToWorkspace;
    }

    public void setIsSharedToWorkspace(Boolean isSharedToWorkspace) {
        this.isSharedToWorkspace = isSharedToWorkspace;
    }

    public SharedPermissions getSharedPermissions() {
        return sharedPermissions;
    }

    public void setSharedPermissions(SharedPermissions sharedPermissions) {
        this.sharedPermissions = sharedPermissions;
    }

    public Boolean getCanView() {
        return canView;
    }

    public void setCanView(Boolean canView) {
        this.canView = canView;
    }

    public Boolean getCanEdit() {
        return canEdit;
    }

    public void setCanEdit(Boolean canEdit) {
        this.canEdit = canEdit;
    }

    public Boolean getCanDelete() {
        return canDelete;
    }

    public void setCanDelete(Boolean canDelete) {
        this.canDelete = canDelete;
    }

    public Boolean getCanAssign() {
        return canAssign;
    }

    public void setCanAssign(Boolean canAssign) {
        this.canAssign = canAssign;
    }

    public Integer getSubTasksCount() {
        return subTasksCount;
    }

    public void setSubTasksCount(Integer subTasksCount) {
        this.subTasksCount = subTasksCount;
    }

    public Integer getCompletedSubTasksCount() {
        return completedSubTasksCount;
    }

    public void setCompletedSubTasksCount(Integer completedSubTasksCount) {
        this.completedSubTasksCount = completedSubTasksCount;
    }

    public Double getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(Double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
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

    public Boolean getIsOverdue() {
        return isOverdue;
    }

    public void setIsOverdue(Boolean isOverdue) {
        this.isOverdue = isOverdue;
    }

    public Boolean getIsDueSoon() {
        return isDueSoon;
    }

    public void setIsDueSoon(Boolean isDueSoon) {
        this.isDueSoon = isDueSoon;
    }

    public Boolean getIsAssigned() {
        return isAssigned;
    }

    public void setIsAssigned(Boolean isAssigned) {
        this.isAssigned = isAssigned;
    }

    public List<Task.SubTask> getSubTasks() {
        return subTasks;
    }

    public void setSubTasks(List<Task.SubTask> subTasks) {
        this.subTasks = subTasks;
    }
}
