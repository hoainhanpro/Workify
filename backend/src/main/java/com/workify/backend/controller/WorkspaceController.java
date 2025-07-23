package com.workify.backend.controller;

import com.workify.backend.dto.*;
import com.workify.backend.model.User;
import com.workify.backend.model.Workspace;
import com.workify.backend.model.WorkspaceMember;
import com.workify.backend.model.WorkspaceRole;
import com.workify.backend.security.SecurityUtils;
import com.workify.backend.service.UserService;
import com.workify.backend.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller cho Workspace management
 */
@RestController
@RequestMapping("/api/workspaces")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasRole('USER')")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private UserService userService;

    /**
     * Tạo workspace mới
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createWorkspace(@Valid @RequestBody WorkspaceCreateRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            Workspace workspace = workspaceService.createWorkspace(
                    request.getName(),
                    request.getDescription(),
                    actualUserId);

            WorkspaceResponse workspaceResponse = convertToResponse(workspace, actualUserId);

            response.put("success", true);
            response.put("message", "Workspace created successfully");
            response.put("data", workspaceResponse);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create workspace: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy tất cả workspace của user
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserWorkspaces() {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            List<Workspace> workspaces = workspaceService.getWorkspacesByUserId(actualUserId);
            List<WorkspaceResponse> workspaceResponses = workspaces.stream()
                    .map(workspace -> convertToResponse(workspace, actualUserId))
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", workspaceResponses);
            response.put("count", workspaceResponses.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve workspaces: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy workspace theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getWorkspaceById(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            Optional<Workspace> workspaceOpt = workspaceService.getWorkspaceByIdAndUserId(id, actualUserId);
            if (workspaceOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Workspace not found or you don't have access");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Workspace workspace = workspaceOpt.get();
            WorkspaceResponse workspaceResponse = convertToResponse(workspace, actualUserId);

            response.put("success", true);
            response.put("data", workspaceResponse);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve workspace: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update workspace
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateWorkspace(
            @PathVariable String id,
            @Valid @RequestBody WorkspaceUpdateRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            Workspace workspace = workspaceService.updateWorkspace(
                    id,
                    request.getName(),
                    request.getDescription(),
                    actualUserId);

            WorkspaceResponse workspaceResponse = convertToResponse(workspace, actualUserId);

            response.put("success", true);
            response.put("message", "Workspace updated successfully");
            response.put("data", workspaceResponse);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update workspace: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Xóa workspace
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteWorkspace(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            workspaceService.deleteWorkspace(id, actualUserId);

            response.put("success", true);
            response.put("message", "Workspace deleted successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete workspace: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy danh sách members của workspace
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<Map<String, Object>> getWorkspaceMembers(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            List<WorkspaceMember> members = workspaceService.getWorkspaceMembers(id, actualUserId);
            List<WorkspaceMemberResponse> memberResponses = members.stream()
                    .map(this::convertToMemberResponse)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", memberResponses);
            response.put("count", memberResponses.size());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve members: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Xóa member khỏi workspace
     */
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Map<String, Object>> removeMember(
            @PathVariable String id,
            @PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualRequestUserId = getCurrentActualUserId();

            workspaceService.removeMember(id, userId, actualRequestUserId);

            response.put("success", true);
            response.put("message", "Member removed successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to remove member: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Cập nhật role của member
     */
    @PutMapping("/{id}/members/{userId}/role")
    public ResponseEntity<Map<String, Object>> updateMemberRole(
            @PathVariable String id,
            @PathVariable String userId,
            @RequestBody Map<String, String> requestBody) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualRequestUserId = getCurrentActualUserId();
            String roleStr = requestBody.get("role");

            if (roleStr == null) {
                response.put("success", false);
                response.put("message", "Role is required");
                return ResponseEntity.badRequest().body(response);
            }

            WorkspaceRole newRole = WorkspaceRole.valueOf(roleStr.toUpperCase());

            workspaceService.updateMemberRole(id, userId, newRole, actualRequestUserId);

            response.put("success", true);
            response.put("message", "Member role updated successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update member role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Helper methods

    private WorkspaceResponse convertToResponse(Workspace workspace, String currentUserId) {
        WorkspaceResponse response = new WorkspaceResponse(workspace);

        // Populate owner info
        Optional<User> ownerOpt = userService.findById(workspace.getOwnerId());
        if (ownerOpt.isPresent()) {
            User owner = ownerOpt.get();
            response.setOwnerUsername(owner.getUsername());
            response.setOwnerFullName(owner.getFullName());
        }

        // Populate members
        List<WorkspaceMemberResponse> memberResponses = workspace.getMembers().stream()
                .map(this::convertToMemberResponse)
                .collect(Collectors.toList());
        response.setMembers(memberResponses);

        // Set user permissions
        Optional<WorkspaceMember> currentMember = workspace.findMemberByUserId(currentUserId);
        if (currentMember.isPresent()) {
            response.setUserRole(currentMember.get().getRole().toString());
            response.setCanEdit(workspace.hasAdminRole(currentUserId));
            response.setCanInvite(workspace.hasAdminRole(currentUserId));
            response.setOwner(workspace.isOwner(currentUserId));
        }

        return response;
    }

    private WorkspaceMemberResponse convertToMemberResponse(WorkspaceMember member) {
        WorkspaceMemberResponse response = new WorkspaceMemberResponse(member);

        // Populate user info
        Optional<User> userOpt = userService.findById(member.getUserId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            response.setUsername(user.getUsername());
            response.setFullName(user.getFullName());
            response.setEmail(user.getEmail());
            response.setProfilePicture(user.getProfilePicture());
        }

        return response;
    }

    /**
     * Helper method để lấy user ID thật từ SecurityContext
     */
    private String getCurrentActualUserId() {
        String username = SecurityUtils.getCurrentUserId(); // This returns username
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return userOpt.get().getId(); // Return actual MongoDB _id
    }
}
