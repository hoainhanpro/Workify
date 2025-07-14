package com.workify.backend.dto;

import java.time.LocalDateTime;

/**
 * GĐ9: DTO cho response của NoteVersion
 */
public class NoteVersionResponse {
    
    private String content;
    private LocalDateTime timestamp;
    private String changeDescription;
    
    // Constructors
    public NoteVersionResponse() {}
    
    public NoteVersionResponse(String content, LocalDateTime timestamp, String changeDescription) {
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
}
