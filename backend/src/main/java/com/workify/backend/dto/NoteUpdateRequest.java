package com.workify.backend.dto;

import jakarta.validation.constraints.Size;

public class NoteUpdateRequest {
    
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String title;
    
    @Size(max = 50000, message = "Nội dung không được vượt quá 50000 ký tự")
    private String content; // Hỗ trợ rich text HTML content
    
    // Constructors
    public NoteUpdateRequest() {}
    
    public NoteUpdateRequest(String title, String content) {
        this.title = title;
        this.content = content;
    }
    
    // Getters and Setters
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
}
