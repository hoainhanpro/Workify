package com.workify.backend.controller;

import com.workify.backend.security.SecurityUtils;
import com.workify.backend.service.TaskService;
import com.workify.backend.service.NoteService;
import com.workify.backend.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasRole('USER')")
public class WorkspaceStatsController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private NoteService noteService;

    @Autowired
    private WorkspaceService workspaceService;

    /**
     * Lấy thống kê tổng quan workspace (Basic implementation)
     */
    @GetMapping("/{workspaceId}/stats")
    public ResponseEntity<Map<String, Object>> getWorkspaceStats(@PathVariable String workspaceId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();

            Map<String, Object> stats = new HashMap<>();

            // Task statistics
            long totalTasks = taskService.countWorkspaceTasks(workspaceId);
            long myAssignedTasks = taskService.countAssignedTasksInWorkspace(workspaceId, userId);

            stats.put("totalTasks", totalTasks);
            stats.put("myAssignedTasks", myAssignedTasks);

            // Note statistics - sử dụng existing method
            long totalNotes = noteService.countWorkspaceNotes(workspaceId);
            long myNotes = noteService.countWorkspaceNotesByAuthor(workspaceId, userId);

            stats.put("totalNotes", totalNotes);
            stats.put("myNotes", myNotes);

            // Workspace info
            stats.put("workspaceId", workspaceId);

            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve workspace stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy workspace activity summary cho user (Basic implementation)
     */
    @GetMapping("/{workspaceId}/activity-summary")
    public ResponseEntity<Map<String, Object>> getWorkspaceActivitySummary(@PathVariable String workspaceId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();

            Map<String, Object> activity = new HashMap<>();

            // Tasks được assign cho user
            activity.put("assignedTasks", taskService.getAssignedTasksInWorkspace(workspaceId, userId).size());

            // Tasks user đã tạo
            activity.put("createdTasks", taskService.getCreatedTasksInWorkspace(workspaceId, userId).size());

            // Notes user có thể view
            activity.put("accessibleNotes", noteService.getWorkspaceNotesForUser(workspaceId, userId).size());

            // Notes user đã tạo
            activity.put("createdNotes", noteService.getWorkspaceNotesByAuthor(workspaceId, userId).size());

            response.put("success", true);
            response.put("data", activity);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve activity summary: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
