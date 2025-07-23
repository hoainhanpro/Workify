package com.workify.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notes")
public class Note {

    @Id
    private String id;

    private String title;

    private String content; // Hỗ trợ Rich text HTML content (GĐ2)

    private String authorId; // ID của người tạo note

    private List<String> tagIds = new ArrayList<>(); // GĐ5: Danh sách ID của tags

    private Boolean isPinned = false; // GĐ5: Đánh dấu note được ghim

    private List<Attachment> attachments = new ArrayList<>(); // GĐ7: Danh sách file đính kèm

    private List<NoteVersion> versionHistory = new ArrayList<>(); // GĐ9: Lịch sử phiên bản

    // Workspace integration fields
    private String workspaceId; // null = personal note
    private Boolean isSharedToWorkspace = false; // note có được chia sẻ lên workspace không
    private SharedPermissions sharedPermissions; // quyền truy cập chi tiết

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Constructors
    public Note() {
    }

    public Note(String title, String content, String authorId) {
        this.title = title;
        this.content = content;
        this.authorId = authorId;
        this.tagIds = new ArrayList<>();
        this.isPinned = false;
        this.attachments = new ArrayList<>(); // GĐ7: Khởi tạo danh sách attachments
        this.versionHistory = new ArrayList<>(); // GĐ9: Khởi tạo lịch sử phiên bản
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
        this.tagIds = tagIds != null ? tagIds : new ArrayList<>();
    }

    // GĐ5: Getter và Setter cho isPinned
    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned != null ? isPinned : false;
    }

    // GĐ7: Getter và Setter cho attachments
    public List<Attachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<Attachment> attachments) {
        this.attachments = attachments != null ? attachments : new ArrayList<>();
    }

    // GĐ9: Getter và Setter cho versionHistory
    public List<NoteVersion> getVersionHistory() {
        return versionHistory;
    }

    public void setVersionHistory(List<NoteVersion> versionHistory) {
        this.versionHistory = versionHistory != null ? versionHistory : new ArrayList<>();
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

    // ============= WORKSPACE FIELDS GETTERS AND SETTERS =============

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
     * Kiểm tra note có phải là personal note không
     */
    public boolean isPersonalNote() {
        return workspaceId == null || workspaceId.isEmpty();
    }

    /**
     * Kiểm tra note có được chia sẻ lên workspace không
     */
    public boolean isSharedNote() {
        return isSharedToWorkspace != null && isSharedToWorkspace && workspaceId != null;
    }

    /**
     * Kiểm tra user có quyền view note này không
     */
    public boolean canUserView(String userId) {
        // Author của note luôn có quyền view
        if (this.authorId.equals(userId)) {
            return true;
        }

        // Nếu là personal note, chỉ author mới view được
        if (isPersonalNote()) {
            return false;
        }

        // Kiểm tra shared permissions
        if (sharedPermissions != null) {
            return sharedPermissions.canUserView(userId);
        }

        return false;
    }

    /**
     * Kiểm tra user có quyền edit note này không
     */
    public boolean canUserEdit(String userId) {
        // Author của note luôn có quyền edit
        if (this.authorId.equals(userId)) {
            return true;
        }

        // Nếu là personal note, chỉ author mới edit được
        if (isPersonalNote()) {
            return false;
        }

        // Kiểm tra shared permissions
        if (sharedPermissions != null) {
            return sharedPermissions.canUserEdit(userId);
        }

        return false;
    }

    /**
     * Share note to workspace với permissions mặc định
     */
    public void shareToWorkspace(String workspaceId) {
        this.workspaceId = workspaceId;
        this.isSharedToWorkspace = true;
        if (this.sharedPermissions == null) {
            this.sharedPermissions = new SharedPermissions();
        }
    }

    @Override
    public String toString() {
        return "Note{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", authorId='" + authorId + '\'' +
                ", workspaceId='" + workspaceId + '\'' +
                ", isSharedToWorkspace=" + isSharedToWorkspace +
                ", tagIds=" + tagIds +
                ", isPinned=" + isPinned +
                ", attachments=" + attachments +
                ", versionHistory=" + versionHistory +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
