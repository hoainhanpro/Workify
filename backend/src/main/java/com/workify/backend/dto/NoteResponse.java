package com.workify.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.workify.backend.model.Note;

public class NoteResponse {

    private String id;
    private String title;
    private String content;
    private String authorId;
    private List<String> tagIds; // GĐ5: Tag IDs
    private List<TagResponse> tags; // GĐ5: Tag details (populated từ service)
    private Boolean isPinned; // GĐ5: Pin status
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Workspace integration fields
    private String workspaceId; // ID của workspace (null = personal note)
    private String workspaceName; // Tên workspace để hiển thị
    private Boolean isSharedToWorkspace = false; // note có được chia sẻ lên workspace không
    private String authorUsername; // Username của author
    private String authorFullName; // Full name của author

    // Constructors
    public NoteResponse() {
    }

    public NoteResponse(Note note) {
        this.id = note.getId();
        this.title = note.getTitle();
        this.content = note.getContent();
        this.authorId = note.getAuthorId();
        this.tagIds = note.getTagIds(); // GĐ5
        this.isPinned = note.getIsPinned(); // GĐ5
        this.createdAt = note.getCreatedAt();
        this.updatedAt = note.getUpdatedAt();

        // Workspace integration fields
        this.workspaceId = note.getWorkspaceId();
        this.isSharedToWorkspace = note.getIsSharedToWorkspace();

        // tags sẽ được populate từ service
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

    // GĐ5: Getter và Setter cho tagIds
    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }

    // GĐ5: Getter và Setter cho tags (full info)
    public List<TagResponse> getTags() {
        return tags;
    }

    public void setTags(List<TagResponse> tags) {
        this.tags = tags;
    }

    // GĐ5: Getter và Setter cho isPinned
    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
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

    public Boolean getIsSharedToWorkspace() {
        return isSharedToWorkspace;
    }

    public void setIsSharedToWorkspace(Boolean isSharedToWorkspace) {
        this.isSharedToWorkspace = isSharedToWorkspace;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }

    public String getAuthorFullName() {
        return authorFullName;
    }

    public void setAuthorFullName(String authorFullName) {
        this.authorFullName = authorFullName;
    }
}
