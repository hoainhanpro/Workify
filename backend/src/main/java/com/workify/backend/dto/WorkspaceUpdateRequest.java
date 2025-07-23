package com.workify.backend.dto;

import jakarta.validation.constraints.Size;

/**
 * DTO cho update workspace
 */
public class WorkspaceUpdateRequest {

    @Size(max = 100, message = "Workspace name cannot exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Workspace description cannot exceed 500 characters")
    private String description;

    // Constructors
    public WorkspaceUpdateRequest() {
    }

    public WorkspaceUpdateRequest(String name, String description) {
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
        return "WorkspaceUpdateRequest{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
