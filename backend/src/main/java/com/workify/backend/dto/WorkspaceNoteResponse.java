package com.workify.backend.dto;

import com.workify.backend.model.Note;
import com.workify.backend.model.SharedPermissions;
import java.time.LocalDateTime;
import java.util.List;

public class WorkspaceNoteResponse {

    private String id;
    private String title;
    private String content; // Có thể truncate cho performance
    private String authorId;
    private String authorEmail;
    private String authorName;

    // Workspace specific fields
    private String workspaceId;
    private Boolean isSharedToWorkspace;
    private SharedPermissions sharedPermissions;

    // Permission fields for current user
    private Boolean canView;
    private Boolean canEdit;
    private Boolean canDelete;

    private List<String> tagIds;
    private Boolean isPinned;
    private Integer attachmentsCount;
    private Integer versionsCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Content preview for list views
    private String contentPreview; // First 200 characters
    private Boolean hasAttachments;
    private Boolean hasVersions;

    public WorkspaceNoteResponse() {
    }

    public WorkspaceNoteResponse(Note note, String currentUserId) {
        this.id = note.getId();
        this.title = note.getTitle();
        this.content = note.getContent();
        this.authorId = note.getAuthorId();

        // Workspace fields
        this.workspaceId = note.getWorkspaceId();
        this.isSharedToWorkspace = note.getIsSharedToWorkspace();
        this.sharedPermissions = note.getSharedPermissions();

        // Permission checks
        this.canView = note.canUserView(currentUserId);
        this.canEdit = note.canUserEdit(currentUserId);
        this.canDelete = note.getAuthorId().equals(currentUserId); // Chỉ author mới delete được

        this.tagIds = note.getTagIds();
        this.isPinned = note.getIsPinned();
        this.attachmentsCount = note.getAttachments() != null ? note.getAttachments().size() : 0;
        this.versionsCount = note.getVersionHistory() != null ? note.getVersionHistory().size() : 0;

        this.createdAt = note.getCreatedAt();
        this.updatedAt = note.getUpdatedAt();

        // Content preview
        if (note.getContent() != null && note.getContent().length() > 200) {
            this.contentPreview = note.getContent().substring(0, 200) + "...";
        } else {
            this.contentPreview = note.getContent();
        }

        this.hasAttachments = this.attachmentsCount > 0;
        this.hasVersions = this.versionsCount > 0;
    }

    // Constructor for list view (without full content)
    public WorkspaceNoteResponse(Note note, String currentUserId, boolean isListView) {
        this(note, currentUserId);

        if (isListView) {
            this.content = null; // Don't include full content in list view
        }
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
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

    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }

    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
    }

    public Integer getAttachmentsCount() {
        return attachmentsCount;
    }

    public void setAttachmentsCount(Integer attachmentsCount) {
        this.attachmentsCount = attachmentsCount;
    }

    public Integer getVersionsCount() {
        return versionsCount;
    }

    public void setVersionsCount(Integer versionsCount) {
        this.versionsCount = versionsCount;
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

    public String getContentPreview() {
        return contentPreview;
    }

    public void setContentPreview(String contentPreview) {
        this.contentPreview = contentPreview;
    }

    public Boolean getHasAttachments() {
        return hasAttachments;
    }

    public void setHasAttachments(Boolean hasAttachments) {
        this.hasAttachments = hasAttachments;
    }

    public Boolean getHasVersions() {
        return hasVersions;
    }

    public void setHasVersions(Boolean hasVersions) {
        this.hasVersions = hasVersions;
    }
}
