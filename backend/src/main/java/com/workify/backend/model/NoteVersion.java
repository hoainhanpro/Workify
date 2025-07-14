package com.workify.backend.model;

import java.time.LocalDateTime;

/**
 * GĐ9: Lưu trữ lịch sử phiên bản của Note
 * Chỉ lưu content, timestamp để undo/redo
 */
public class NoteVersion {
    
    private String content; // Nội dung của note tại thời điểm này
    
    private LocalDateTime timestamp; // Thời gian tạo phiên bản
    
    private String changeDescription; // Mô tả thay đổi (optional)
    
    // Constructors
    public NoteVersion() {}
    
    public NoteVersion(String content, LocalDateTime timestamp) {
        this.content = content;
        this.timestamp = timestamp;
    }
    
    public NoteVersion(String content, LocalDateTime timestamp, String changeDescription) {
        this.content = content;
        this.timestamp = timestamp;
        this.changeDescription = changeDescription;
    }
    
    // Getters and Setters
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getChangeDescription() {
        return changeDescription;
    }
    
    public void setChangeDescription(String changeDescription) {
        this.changeDescription = changeDescription;
    }
    
    @Override
    public String toString() {
        return "NoteVersion{" +
                "content='" + content + '\'' +
                ", timestamp=" + timestamp +
                ", changeDescription='" + changeDescription + '\'' +
                '}';
    }
}
