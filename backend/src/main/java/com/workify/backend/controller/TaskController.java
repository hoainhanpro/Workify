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
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
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
    @GetMapping("/tag/{tagId}")
    public ResponseEntity<Map<String, Object>> getTasksByTag(@PathVariable String tagId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.getTasksByTagId(userId, tagId);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            response.put("tagId", tagId);
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

            // Handle due date and calendar sync
            task.setDueDate(taskRequest.getDueDate());
            task.setSyncWithCalendar(
                    taskRequest.getSyncWithCalendar() != null ? taskRequest.getSyncWithCalendar() : false);

            // Handle SubTasks if provided
            if (taskRequest.getSubTasks() != null && !taskRequest.getSubTasks().isEmpty()) {
                List<Task.SubTask> subTasks = new java.util.ArrayList<>();
                for (TaskRequest.SubTaskRequest subTaskReq : taskRequest.getSubTasks()) {
                    Task.SubTask subTask = new Task.SubTask();
                    subTask.setId(java.util.UUID.randomUUID().toString());
                    subTask.setTitle(subTaskReq.getTitle());
                    subTask.setDescription(subTaskReq.getDescription());
                    subTask.setStatus(subTaskReq.getStatus() != null ? subTaskReq.getStatus() : Task.TaskStatus.TODO);
                    subTask.setPriority(
                            subTaskReq.getPriority() != null ? subTaskReq.getPriority() : Task.TaskPriority.MEDIUM);
                    subTask.setDueDate(subTaskReq.getDueDate());
                    subTask.setCreatedAt(java.time.LocalDateTime.now());
                    subTask.setUpdatedAt(java.time.LocalDateTime.now());
                    subTasks.add(subTask);
                }
                task.setSubTasks(subTasks);
            }

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

            // Handle due date and calendar sync
            updatedTask.setDueDate(taskRequest.getDueDate());
            updatedTask.setSyncWithCalendar(taskRequest.getSyncWithCalendar());

            // Handle SubTasks if provided (replace existing)
            if (taskRequest.getSubTasks() != null) {
                List<Task.SubTask> subTasks = new java.util.ArrayList<>();
                for (TaskRequest.SubTaskRequest subTaskReq : taskRequest.getSubTasks()) {
                    Task.SubTask subTask = new Task.SubTask();
                    subTask.setId(java.util.UUID.randomUUID().toString());
                    subTask.setTitle(subTaskReq.getTitle());
                    subTask.setDescription(subTaskReq.getDescription());
                    subTask.setStatus(subTaskReq.getStatus() != null ? subTaskReq.getStatus() : Task.TaskStatus.TODO);
                    subTask.setPriority(
                            subTaskReq.getPriority() != null ? subTaskReq.getPriority() : Task.TaskPriority.MEDIUM);
                    subTask.setDueDate(subTaskReq.getDueDate());
                    subTask.setCreatedAt(java.time.LocalDateTime.now());
                    subTask.setUpdatedAt(java.time.LocalDateTime.now());
                    subTasks.add(subTask);
                }
                updatedTask.setSubTasks(subTasks);
            }

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

    // ============= SUBTASK ENDPOINTS =============

    /**
     * Add SubTask to existing Task
     */
    @PostMapping("/{taskId}/subtasks")
    public ResponseEntity<Map<String, Object>> addSubTask(
            @PathVariable String taskId,
            @Valid @RequestBody TaskRequest.SubTaskRequest subTaskRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();

            Task.SubTask subTask = new Task.SubTask();
            subTask.setTitle(subTaskRequest.getTitle());
            subTask.setDescription(subTaskRequest.getDescription());
            subTask.setStatus(subTaskRequest.getStatus() != null ? subTaskRequest.getStatus() : Task.TaskStatus.TODO);
            subTask.setPriority(
                    subTaskRequest.getPriority() != null ? subTaskRequest.getPriority() : Task.TaskPriority.MEDIUM);
            subTask.setDueDate(subTaskRequest.getDueDate());

            Optional<Task> result = taskService.addSubTask(taskId, userId, subTask);

            if (result.isPresent()) {
                response.put("success", true);
                response.put("message", "SubTask added successfully");
                response.put("data", new TaskResponse(result.get()));
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found or you don't have permission to modify it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to add SubTask: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update SubTask
     */
    @PutMapping("/{taskId}/subtasks/{subTaskId}")
    public ResponseEntity<Map<String, Object>> updateSubTask(
            @PathVariable String taskId,
            @PathVariable String subTaskId,
            @Valid @RequestBody TaskRequest.SubTaskRequest subTaskRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();

            Task.SubTask updatedSubTask = new Task.SubTask();
            updatedSubTask.setTitle(subTaskRequest.getTitle());
            updatedSubTask.setDescription(subTaskRequest.getDescription());
            updatedSubTask.setStatus(subTaskRequest.getStatus());
            updatedSubTask.setPriority(subTaskRequest.getPriority());
            updatedSubTask.setDueDate(subTaskRequest.getDueDate());

            Optional<Task> result = taskService.updateSubTask(taskId, userId, subTaskId, updatedSubTask);

            if (result.isPresent()) {
                response.put("success", true);
                response.put("message", "SubTask updated successfully");
                response.put("data", new TaskResponse(result.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task or SubTask not found, or you don't have permission to modify it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update SubTask: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete SubTask
     */
    @DeleteMapping("/{taskId}/subtasks/{subTaskId}")
    public ResponseEntity<Map<String, Object>> deleteSubTask(
            @PathVariable String taskId,
            @PathVariable String subTaskId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Optional<Task> result = taskService.deleteSubTask(taskId, userId, subTaskId);

            if (result.isPresent()) {
                response.put("success", true);
                response.put("message", "SubTask deleted successfully");
                response.put("data", new TaskResponse(result.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task or SubTask not found, or you don't have permission to delete it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete SubTask: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get specific SubTask
     */
    @GetMapping("/{taskId}/subtasks/{subTaskId}")
    public ResponseEntity<Map<String, Object>> getSubTask(
            @PathVariable String taskId,
            @PathVariable String subTaskId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Optional<Task.SubTask> subTask = taskService.getSubTask(taskId, userId, subTaskId);

            if (subTask.isPresent()) {
                response.put("success", true);
                response.put("data", new TaskResponse.SubTaskResponse(subTask.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "SubTask not found or you don't have permission to access it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve SubTask: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= CALENDAR ENDPOINTS =============

    /**
     * Get tasks with due dates in range
     */
    @GetMapping("/due-dates")
    public ResponseEntity<Map<String, Object>> getTasksWithDueDates(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime from,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime to) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.getTasksWithDueDates(userId, from, to);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(java.util.stream.Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            response.put("dateRange", Map.of("from", from, "to", to));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve tasks with due dates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get overdue tasks
     */
    @GetMapping("/overdue")
    public ResponseEntity<Map<String, Object>> getOverdueTasks() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.getOverdueTasks(userId);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(java.util.stream.Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve overdue tasks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update calendar sync setting for task
     */
    @PutMapping("/{taskId}/calendar/sync")
    public ResponseEntity<Map<String, Object>> updateCalendarSync(
            @PathVariable String taskId,
            @RequestParam Boolean enabled) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Optional<Task> result = taskService.updateCalendarSync(taskId, userId, enabled);

            if (result.isPresent()) {
                response.put("success", true);
                response.put("message", "Calendar sync updated successfully");
                response.put("data", new TaskResponse(result.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found or you don't have permission to modify it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update calendar sync: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= ANALYTICS & DASHBOARD ENDPOINTS =============

    /**
     * Get task analytics for dashboard
     */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getTaskAnalytics() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Map<String, Object> analytics = taskService.getTaskAnalytics(userId);

            response.put("success", true);
            response.put("data", analytics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve task analytics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get tasks due today
     */
    @GetMapping("/due-today")
    public ResponseEntity<Map<String, Object>> getTasksDueToday() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.getTasksDueToday(userId);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(java.util.stream.Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve tasks due today: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get tasks due this week
     */
    @GetMapping("/due-this-week")
    public ResponseEntity<Map<String, Object>> getTasksDueThisWeek() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Task> tasks = taskService.getTasksDueThisWeek(userId);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(java.util.stream.Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve tasks due this week: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Auto-update task status based on subtasks
     */
    @PostMapping("/{taskId}/auto-update-status")
    public ResponseEntity<Map<String, Object>> autoUpdateTaskStatus(@PathVariable String taskId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Optional<Task> result = taskService.autoUpdateTaskStatus(taskId, userId);

            if (result.isPresent()) {
                response.put("success", true);
                response.put("message", "Task status updated successfully");
                response.put("data", new TaskResponse(result.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found or you don't have permission to modify it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to auto-update task status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ============= VALIDATION ENDPOINTS =============

    /**
     * Validate task data
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateTask(@Valid @RequestBody TaskRequest taskRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Convert TaskRequest to Task for validation
            Task task = new Task();
            task.setTitle(taskRequest.getTitle());
            task.setDescription(taskRequest.getDescription());
            task.setStatus(taskRequest.getStatus() != null ? taskRequest.getStatus() : Task.TaskStatus.TODO);
            task.setPriority(taskRequest.getPriority() != null ? taskRequest.getPriority() : Task.TaskPriority.MEDIUM);
            task.setDueDate(taskRequest.getDueDate());
            task.setSyncWithCalendar(taskRequest.getSyncWithCalendar());

            // Convert and validate SubTasks
            if (taskRequest.getSubTasks() != null) {
                List<Task.SubTask> subTasks = new java.util.ArrayList<>();
                for (TaskRequest.SubTaskRequest subTaskReq : taskRequest.getSubTasks()) {
                    Task.SubTask subTask = new Task.SubTask();
                    subTask.setTitle(subTaskReq.getTitle());
                    subTask.setDescription(subTaskReq.getDescription());
                    subTask.setStatus(subTaskReq.getStatus() != null ? subTaskReq.getStatus() : Task.TaskStatus.TODO);
                    subTask.setPriority(
                            subTaskReq.getPriority() != null ? subTaskReq.getPriority() : Task.TaskPriority.MEDIUM);
                    subTask.setDueDate(subTaskReq.getDueDate());
                    subTasks.add(subTask);
                }
                task.setSubTasks(subTasks);
            }

            List<String> validationErrors = taskService.validateTask(task);

            if (validationErrors.isEmpty()) {
                response.put("success", true);
                response.put("message", "Task validation passed");
                response.put("valid", true);
            } else {
                response.put("success", true);
                response.put("message", "Task validation failed");
                response.put("valid", false);
                response.put("errors", validationErrors);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to validate task: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Sync task with Google Calendar manually
     */
    @PostMapping("/{taskId}/calendar/sync")
    public ResponseEntity<Map<String, Object>> syncTaskWithCalendar(@PathVariable String taskId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Optional<Task> result = taskService.syncTaskWithCalendar(taskId, userId);

            if (result.isPresent()) {
                response.put("success", true);
                response.put("message", "Task synced with calendar successfully");
                response.put("data", new TaskResponse(result.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to sync with calendar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Bulk sync all user's tasks with calendar
     */
    @PostMapping("/calendar/sync-all")
    public ResponseEntity<Map<String, Object>> syncAllTasksWithCalendar() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Map<String, Object> syncResult = taskService.syncAllTasksWithCalendar(userId);

            response.put("success", true);
            response.put("message", "Bulk calendar sync completed");
            response.putAll(syncResult);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to sync tasks with calendar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get calendar event details for task
     */
    @GetMapping("/{taskId}/calendar/event")
    public ResponseEntity<Map<String, Object>> getTaskCalendarEvent(@PathVariable String taskId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Map<String, Object> calendarEvent = taskService.getTaskCalendarEvent(taskId, userId);

            if (calendarEvent != null) {
                response.put("success", true);
                response.put("data", calendarEvent);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "No calendar event found for this task");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get calendar event: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update Google Calendar event ID for task
     */
    @PutMapping("/{taskId}/calendar/event-id")
    public ResponseEntity<Map<String, Object>> updateCalendarEventId(
            @PathVariable String taskId,
            @RequestBody Map<String, String> requestBody) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            String eventId = requestBody.get("eventId");

            Optional<Task> result = taskService.updateGoogleCalendarEventId(taskId, userId, eventId);

            if (result.isPresent()) {
                response.put("success", true);
                response.put("message", "Calendar event ID updated successfully");
                response.put("data", new TaskResponse(result.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Task not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update calendar event ID: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ========== WORKSPACE TASK ENDPOINTS ==========

    /**
     * Chia sẻ task tới workspace
     */
    @PostMapping("/{taskId}/share-to-workspace/{workspaceId}")
    public ResponseEntity<Map<String, Object>> shareTaskToWorkspace(
            @PathVariable String taskId,
            @PathVariable String workspaceId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();

            Task result = taskService.shareTaskToWorkspace(taskId, workspaceId, userId);

            response.put("success", true);
            response.put("message", "Task shared to workspace successfully");
            response.put("data", new TaskResponse(result));
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to share task: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Assign task cho user trong workspace
     */
    @PostMapping("/{taskId}/assign/{assigneeId}")
    public ResponseEntity<Map<String, Object>> assignTaskToUser(
            @PathVariable String taskId,
            @PathVariable String assigneeId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();

            Task result = taskService.assignTaskToUser(taskId, assigneeId, userId);

            response.put("success", true);
            response.put("message", "Task assigned successfully");
            response.put("data", new TaskResponse(result));
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to assign task: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy tasks của workspace cho user
     */
    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<Map<String, Object>> getWorkspaceTasks(@PathVariable String workspaceId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();

            List<Task> tasks = taskService.getWorkspaceTasksForUser(workspaceId, userId);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve workspace tasks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy tasks được assigned cho user trong workspace
     */
    @GetMapping("/workspace/{workspaceId}/assigned-to-me")
    public ResponseEntity<Map<String, Object>> getAssignedTasks(@PathVariable String workspaceId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();

            List<Task> tasks = taskService.getWorkspaceTasksForUser(workspaceId, userId)
                    .stream()
                    .filter(task -> task.getAssignedToUserId() != null && task.getAssignedToUserId().equals(userId))
                    .collect(Collectors.toList());

            List<TaskResponse> taskResponses = tasks.stream()
                    .map(TaskResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", taskResponses);
            response.put("count", taskResponses.size());
            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve assigned tasks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Unshare task khỏi workspace
     */
    @DeleteMapping("/{taskId}/unshare-from-workspace")
    public ResponseEntity<Map<String, Object>> unshareTaskFromWorkspace(@PathVariable String taskId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();

            Task result = taskService.unshareTaskFromWorkspace(taskId, userId);

            response.put("success", true);
            response.put("message", "Task unshared from workspace successfully");
            response.put("data", new TaskResponse(result));
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to unshare task: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
