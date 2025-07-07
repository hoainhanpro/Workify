package com.workify.backend.controller;

import com.workify.backend.dto.TaskRequest;
import com.workify.backend.dto.TaskResponse;
import com.workify.backend.model.Task;
import com.workify.backend.security.SecurityUtils;
import com.workify.backend.service.TaskService;
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

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@PreAuthorize("hasRole('USER')")
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     * Get all tasks for the current user
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTasks() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.getAllTasksByUserId(userId);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve tasks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get a specific task by ID for the current user
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<Map<String, Object>> getTaskById(@PathVariable String taskId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Optional<Task> task = taskService.getTaskByIdAndUserId(taskId, userId);
            
            if (task.isPresent()) {
                response.put("success", true);
                response.put("data", new TaskResponse(task.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found or you don't have permission to access it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve task: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get tasks by status for the current user
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getTasksByStatus(@PathVariable Task.TaskStatus status) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.getTasksByUserIdAndStatus(userId, status);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            response.put("status", status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve tasks by status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get tasks by priority for the current user
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<Map<String, Object>> getTasksByPriority(@PathVariable Task.TaskPriority priority) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.getTasksByUserIdAndPriority(userId, priority);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            response.put("priority", priority);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve tasks by priority: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Search tasks by title or description for the current user
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchTasks(@RequestParam String q) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.searchTasksByUserId(userId, q);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            response.put("searchTerm", q);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to search tasks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get tasks by tag for the current user
     */
    @GetMapping("/tag/{tag}")
    public ResponseEntity<Map<String, Object>> getTasksByTag(@PathVariable String tag) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.getTasksByUserIdAndTag(userId, tag);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            response.put("tag", tag);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve tasks by tag: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get task statistics for the current user
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getTaskStatistics() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            TaskService.TaskStatistics stats = taskService.getTaskStatistics(userId);
            
            Map<String, Object> statisticsData = new HashMap<>();
            statisticsData.put("total", stats.getTotal());
            statisticsData.put("todo", stats.getTodo());
            statisticsData.put("inProgress", stats.getInProgress());
            statisticsData.put("completed", stats.getCompleted());

            response.put("success", true);
            response.put("data", statisticsData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve task statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Create a new task
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTask(@Valid @RequestBody TaskRequest taskRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            
            Task task = new Task();
            task.setTitle(taskRequest.getTitle());
            task.setDescription(taskRequest.getDescription());
            task.setStatus(taskRequest.getStatus() != null ? taskRequest.getStatus() : Task.TaskStatus.TODO);
            task.setPriority(taskRequest.getPriority() != null ? taskRequest.getPriority() : Task.TaskPriority.MEDIUM);
            task.setUserId(userId);
            task.setTags(taskRequest.getTags());

            Task savedTask = taskService.createTask(task);

            response.put("success", true);
            response.put("message", "Task created successfully");
            response.put("data", new TaskResponse(savedTask));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create task: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update an existing task
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @PathVariable String taskId,
            @Valid @RequestBody TaskRequest taskRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            
            Task updatedTask = new Task();
            updatedTask.setTitle(taskRequest.getTitle());
            updatedTask.setDescription(taskRequest.getDescription());
            updatedTask.setStatus(taskRequest.getStatus());
            updatedTask.setPriority(taskRequest.getPriority());
            updatedTask.setTags(taskRequest.getTags());

            Optional<Task> result = taskService.updateTask(taskId, userId, updatedTask);
            
            if (result.isPresent()) {
                response.put("success", true);
                response.put("message", "Task updated successfully");
                response.put("data", new TaskResponse(result.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found or you don't have permission to update it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update task: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete a task
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable String taskId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            boolean deleted = taskService.deleteTask(taskId, userId);
            
            if (deleted) {
                response.put("success", true);
                response.put("message", "Task deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found or you don't have permission to delete it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete task: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
