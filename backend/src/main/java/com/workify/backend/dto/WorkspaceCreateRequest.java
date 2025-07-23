package com.workify.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO cho tạo workspace mới
 */
public class WorkspaceCreateRequest {

    @NotBlank(message = "Workspace name cannot be blank")
    @Size(max = 100, message = "Workspace name cannot exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Workspace description cannot exceed 500 characters")
    private String description;

    // Constructors
    public WorkspaceCreateRequest() {
    }

    public WorkspaceCreateRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "WorkspaceCreateRequest{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
