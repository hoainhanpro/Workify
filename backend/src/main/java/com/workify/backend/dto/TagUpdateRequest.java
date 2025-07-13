package com.workify.backend.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO cho việc cập nhật tag
 */
public class TagUpdateRequest {
    
    @Size(min = 1, max = 50, message = "Tên tag phải từ 1-50 ký tự")
    private String name;
    
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", 
             message = "Màu sắc phải ở định dạng hex (#FFFFFF hoặc #FFF)")
    private String color;
    
    @Size(max = 200, message = "Mô tả không được vượt quá 200 ký tự")
    private String description;
    
    // Constructors
    public TagUpdateRequest() {}
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
