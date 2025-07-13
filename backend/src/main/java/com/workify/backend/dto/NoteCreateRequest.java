package com.workify.backend.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class NoteCreateRequest {
    
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String title;
    
    @Size(max = 50000, message = "Nội dung không được vượt quá 50000 ký tự")
    private String content; // Hỗ trợ rich text HTML content
    
    // GĐ5: Danh sách ID của tags
    private List<String> tagIds = new ArrayList<>();
    
    // GĐ5: Đánh dấu pin note
    private Boolean isPinned = false;
    
    // Constructors
    public NoteCreateRequest() {}
    
    public NoteCreateRequest(String title, String content) {
        this.title = title;
        this.content = content;
        this.tagIds = new ArrayList<>();
        this.isPinned = false;
    }
    
    public NoteCreateRequest(String title, String content, List<String> tagIds, Boolean isPinned) {
        this.title = title;
        this.content = content;
        this.tagIds = tagIds != null ? tagIds : new ArrayList<>();
        this.isPinned = isPinned != null ? isPinned : false;
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
}
