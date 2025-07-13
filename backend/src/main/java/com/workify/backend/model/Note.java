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
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Constructors
    public Note() {}
    
    public Note(String title, String content, String authorId) {
        this.title = title;
        this.content = content;
        this.authorId = authorId;
        this.tagIds = new ArrayList<>();
        this.isPinned = false;
        this.attachments = new ArrayList<>(); // GĐ7: Khởi tạo danh sách attachments
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
    
    @Override
    public String toString() {
        return "Note{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", authorId='" + authorId + '\'' +
                ", tagIds=" + tagIds +
                ", isPinned=" + isPinned +
                ", attachments=" + attachments +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
