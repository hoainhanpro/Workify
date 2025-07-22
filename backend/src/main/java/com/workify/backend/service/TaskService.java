package com.workify.backend.service;

import com.workify.backend.model.Task;
import com.workify.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private GoogleCalendarService googleCalendarService;

    // Get all tasks for a user
    public List<Task> getAllTasksByUserId(String userId) {
        return taskRepository.findByUserId(userId);
    }

    // Get a specific task by ID for a user
    public Optional<Task> getTaskByIdAndUserId(String taskId, String userId) {
        return taskRepository.findByIdAndUserId(taskId, userId);
    }

    // Get tasks by status for a user
    public List<Task> getTasksByUserIdAndStatus(String userId, Task.TaskStatus status) {
        return taskRepository.findByUserIdAndStatus(userId, status);
    }

    // Get tasks by priority for a user
    public List<Task> getTasksByUserIdAndPriority(String userId, Task.TaskPriority priority) {
        return taskRepository.findByUserIdAndPriority(userId, priority);
    }

    // Search tasks by title or description for a user
    public List<Task> searchTasksByUserId(String userId, String searchTerm) {
        // Parse search term for advanced search features
        List<String> tags = new ArrayList<>();
        Task.TaskPriority priority = null;
        String cleanSearchTerm = searchTerm;

        // Extract hashtags for tag search
        String[] words = searchTerm.split("\\s+");
        StringBuilder cleanTermBuilder = new StringBuilder();

        for (String word : words) {
            if (word.startsWith("#") && word.length() > 1) {
                // Extract tag (remove #)
                tags.add(word.substring(1).toLowerCase());
            } else if (isPriorityKeyword(word)) {
                // Extract priority
                priority = parsePriorityKeyword(word);
            } else {
                // Keep regular search terms
                if (cleanTermBuilder.length() > 0) {
                    cleanTermBuilder.append(" ");
                }
                cleanTermBuilder.append(word);
            }
        }

        cleanSearchTerm = cleanTermBuilder.toString().trim();

        // If we have tags or priority, use advanced search
        if (!tags.isEmpty() || priority != null) {
            return taskRepository.findByUserIdAndAdvancedSearch(userId, cleanSearchTerm, tags, priority);
        } else {
            // Use basic search for title and description
            return taskRepository.findByUserIdAndTitleOrDescriptionContaining(userId, searchTerm);
        }
    }

    // Helper method to check if a word is a priority keyword
    private boolean isPriorityKeyword(String word) {
        String lowerWord = word.toLowerCase();
        return lowerWord.equals("low") || lowerWord.equals("medium") || lowerWord.equals("high") ||
                lowerWord.equals("thấp") || lowerWord.equals("trung") || lowerWord.equals("cao");
    }

    // Helper method to parse priority keyword
    private Task.TaskPriority parsePriorityKeyword(String word) {
        String lowerWord = word.toLowerCase();
        switch (lowerWord) {
            case "low":
            case "thấp":
                return Task.TaskPriority.LOW;
            case "medium":
            case "trung":
                return Task.TaskPriority.MEDIUM;
            case "high":
            case "cao":
                return Task.TaskPriority.HIGH;
            default:
                return null;
        }
    }

    // Get tasks by tag for a user
    public List<Task> getTasksByUserIdAndTag(String userId, String tag) {
        return taskRepository.findByUserIdAndTagsContaining(userId, tag);
    } // Create a new task

    public Task createTask(Task task) {
        // Validate task before saving
        List<String> validationErrors = validateTask(task);
        if (!validationErrors.isEmpty()) {
            throw new IllegalArgumentException("Task validation failed: " + String.join(", ", validationErrors));
        }

        // Generate IDs for SubTasks if they don't have them
        if (task.getSubTasks() != null) {
            for (Task.SubTask subTask : task.getSubTasks()) {
                if (subTask.getId() == null || subTask.getId().isEmpty()) {
                    subTask.setId(java.util.UUID.randomUUID().toString());
                }
                if (subTask.getCreatedAt() == null) {
                    subTask.setCreatedAt(LocalDateTime.now());
                }
                if (subTask.getUpdatedAt() == null) {
                    subTask.setUpdatedAt(LocalDateTime.now());
                }
            }
        }

        Task savedTask = taskRepository.save(task);

        // Handle Google Calendar integration if enabled
        if (savedTask.getSyncWithCalendar() != null && savedTask.getSyncWithCalendar() &&
                savedTask.getDueDate() != null && savedTask.getGoogleCalendarEventId() == null) {
            try {
                String eventId = googleCalendarService.createCalendarEvent(savedTask, savedTask.getUserId());
                if (eventId != null && !eventId.isEmpty()) {
                    savedTask.setGoogleCalendarEventId(eventId);
                    savedTask = taskRepository.save(savedTask);
                }
            } catch (Exception e) {
                // Log error but don't fail the task creation
                System.err.println("Failed to create calendar event: " + e.getMessage());
            }
        }

        return savedTask;
    } // Update an existing task

    public Optional<Task> updateTask(String taskId, String userId, Task updatedTask) {
        Optional<Task> existingTask = taskRepository.findByIdAndUserId(taskId, userId);
        if (existingTask.isPresent()) {
            Task task = existingTask.get();

            // Store original calendar info
            String originalEventId = task.getGoogleCalendarEventId();
            Boolean originalSyncEnabled = task.getSyncWithCalendar();

            // Update basic fields
            task.setTitle(updatedTask.getTitle());
            task.setDescription(updatedTask.getDescription());
            task.setStatus(updatedTask.getStatus());
            task.setPriority(updatedTask.getPriority());
            task.setTags(updatedTask.getTags());

            // Update calendar fields
            task.setDueDate(updatedTask.getDueDate());
            task.setSyncWithCalendar(updatedTask.getSyncWithCalendar());

            // Update subtasks if provided
            if (updatedTask.getSubTasks() != null) {
                // Preserve existing subtask IDs and timestamps where possible
                for (Task.SubTask updatedSubTask : updatedTask.getSubTasks()) {
                    if (updatedSubTask.getId() == null || updatedSubTask.getId().isEmpty()) {
                        updatedSubTask.setId(java.util.UUID.randomUUID().toString());
                        updatedSubTask.setCreatedAt(LocalDateTime.now());
                    }
                    if (updatedSubTask.getUpdatedAt() == null) {
                        updatedSubTask.setUpdatedAt(LocalDateTime.now());
                    }
                }
                task.setSubTasks(updatedTask.getSubTasks());

                // Auto-update main task status based on subtasks
                task.updateStatusFromSubTasks();
            }

            // Validate updated task
            List<String> validationErrors = validateTask(task);
            if (!validationErrors.isEmpty()) {
                throw new IllegalArgumentException("Task validation failed: " + String.join(", ", validationErrors));
            }

            Task savedTask = taskRepository.save(task);

            // Handle Google Calendar integration
            try {
                // If calendar sync was disabled, delete existing event
                if (originalSyncEnabled && originalEventId != null &&
                        (!savedTask.getSyncWithCalendar() || savedTask.getDueDate() == null)) {
                    googleCalendarService.deleteCalendarEvent(originalEventId, userId);
                    savedTask.setGoogleCalendarEventId(null);
                    savedTask = taskRepository.save(savedTask);
                }
                // If calendar sync is enabled and we have due date
                else if (savedTask.getSyncWithCalendar() && savedTask.getDueDate() != null) {
                    if (originalEventId != null && !originalEventId.isEmpty()) {
                        // Update existing calendar event
                        boolean updated = googleCalendarService.updateCalendarEvent(savedTask, userId);
                        if (!updated) {
                            // If update failed, try to create new event
                            String newEventId = googleCalendarService.createCalendarEvent(savedTask, userId);
                            if (newEventId != null) {
                                savedTask.setGoogleCalendarEventId(newEventId);
                                savedTask = taskRepository.save(savedTask);
                            }
                        }
                    } else {
                        // Create new calendar event
                        String eventId = googleCalendarService.createCalendarEvent(savedTask, userId);
                        if (eventId != null && !eventId.isEmpty()) {
                            savedTask.setGoogleCalendarEventId(eventId);
                            savedTask = taskRepository.save(savedTask);
                        }
                    }
                }
            } catch (Exception e) {
                // Log error but don't fail the task update
                System.err.println("Failed to sync with calendar: " + e.getMessage());
            }

            return Optional.of(savedTask);
        }
        return Optional.empty();
    } // Delete a task

    public boolean deleteTask(String taskId, String userId) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();

            // Delete Google Calendar event if exists
            if (task.getGoogleCalendarEventId() != null && !task.getGoogleCalendarEventId().isEmpty()) {
                try {
                    googleCalendarService.deleteCalendarEvent(task.getGoogleCalendarEventId(), userId);
                } catch (Exception e) {
                    // Log error but continue with task deletion
                    System.err.println("Failed to delete calendar event: " + e.getMessage());
                }
            }

            taskRepository.deleteById(taskId);
            return true;
        }
        return false;
    }

    // Get task statistics for a user
    public TaskStatistics getTaskStatistics(String userId) {
        long todoCount = taskRepository.countByUserIdAndStatus(userId, Task.TaskStatus.TODO);
        long inProgressCount = taskRepository.countByUserIdAndStatus(userId, Task.TaskStatus.IN_PROGRESS);
        long completedCount = taskRepository.countByUserIdAndStatus(userId, Task.TaskStatus.COMPLETED);
        long totalCount = todoCount + inProgressCount + completedCount;

        return new TaskStatistics(totalCount, todoCount, inProgressCount, completedCount);
    }

    // Inner class for task statistics
    public static class TaskStatistics {
        private long total;
        private long todo;
        private long inProgress;
        private long completed;

        public TaskStatistics(long total, long todo, long inProgress, long completed) {
            this.total = total;
            this.todo = todo;
            this.inProgress = inProgress;
            this.completed = completed;
        }

        // Getters
        public long getTotal() {
            return total;
        }

        public long getTodo() {
            return todo;
        }

        public long getInProgress() {
            return inProgress;
        }

        public long getCompleted() {
            return completed;
        }
    }

    // Get tasks by tag ID for a user
    public List<Task> getTasksByTagId(String userId, String tagId) {
        // Implement logic to fetch tasks by tagId
        return taskRepository.findByUserIdAndTagId(userId, tagId);
    }

    // ============= SUBTASK OPERATIONS =============

    // Add SubTask to existing Task
    public Optional<Task> addSubTask(String taskId, String userId, Task.SubTask subTask) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            if (task.getSubTasks() == null) {
                task.setSubTasks(new java.util.ArrayList<>());
            }

            // Generate ID for SubTask
            subTask.setId(java.util.UUID.randomUUID().toString());
            subTask.setCreatedAt(java.time.LocalDateTime.now());
            subTask.setUpdatedAt(java.time.LocalDateTime.now());

            task.getSubTasks().add(subTask);
            return Optional.of(taskRepository.save(task));
        }
        return Optional.empty();
    }

    // Update SubTask
    public Optional<Task> updateSubTask(String taskId, String userId, String subTaskId, Task.SubTask updatedSubTask) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            if (task.getSubTasks() != null) {
                for (int i = 0; i < task.getSubTasks().size(); i++) {
                    Task.SubTask existing = task.getSubTasks().get(i);
                    if (existing.getId().equals(subTaskId)) {
                        // Keep original timestamps
                        updatedSubTask.setId(subTaskId);
                        updatedSubTask.setCreatedAt(existing.getCreatedAt());
                        updatedSubTask.setUpdatedAt(java.time.LocalDateTime.now());

                        // Handle completion timestamp
                        if (updatedSubTask.getStatus() == Task.TaskStatus.COMPLETED
                                && existing.getCompletedAt() == null) {
                            updatedSubTask.setCompletedAt(java.time.LocalDateTime.now());
                        } else if (updatedSubTask.getStatus() != Task.TaskStatus.COMPLETED) {
                            updatedSubTask.setCompletedAt(null);
                        } else {
                            updatedSubTask.setCompletedAt(existing.getCompletedAt());
                        }

                        task.getSubTasks().set(i, updatedSubTask);
                        return Optional.of(taskRepository.save(task));
                    }
                }
            }
        }
        return Optional.empty();
    }

    // Delete SubTask
    public Optional<Task> deleteSubTask(String taskId, String userId, String subTaskId) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            if (task.getSubTasks() != null) {
                boolean removed = task.getSubTasks().removeIf(subTask -> subTask.getId().equals(subTaskId));
                if (removed) {
                    return Optional.of(taskRepository.save(task));
                }
            }
        }
        return Optional.empty();
    }

    // Get specific SubTask
    public Optional<Task.SubTask> getSubTask(String taskId, String userId, String subTaskId) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            if (task.getSubTasks() != null) {
                return task.getSubTasks().stream()
                        .filter(subTask -> subTask.getId().equals(subTaskId))
                        .findFirst();
            }
        }
        return Optional.empty();
    }

    // ============= CALENDAR INTEGRATION =============

    // Get tasks with due dates in range
    public List<Task> getTasksWithDueDates(String userId, java.time.LocalDateTime from, java.time.LocalDateTime to) {
        return taskRepository.findByUserIdAndDueDateBetween(userId, from, to);
    }

    // Get overdue tasks
    public List<Task> getOverdueTasks(String userId) {
        return taskRepository.findOverdueTasksByUserId(userId, java.time.LocalDateTime.now());
    }

    // Get tasks synced with calendar
    public List<Task> getTasksSyncedWithCalendar(String userId) {
        return taskRepository.findByUserIdAndSyncWithCalendarTrue(userId);
    }

    // Enable/Disable calendar sync for task
    public Optional<Task> updateCalendarSync(String taskId, String userId, boolean syncEnabled) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setSyncWithCalendar(syncEnabled);
            if (!syncEnabled) {
                task.setGoogleCalendarEventId(null); // Clear calendar event ID when disabling sync
            }
            return Optional.of(taskRepository.save(task));
        }
        return Optional.empty();
    }

    // Update Google Calendar Event ID
    public Optional<Task> updateGoogleCalendarEventId(String taskId, String userId, String eventId) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setGoogleCalendarEventId(eventId);
            if (eventId != null && !eventId.isEmpty()) {
                task.setSyncWithCalendar(true);
            }
            return Optional.of(taskRepository.save(task));
        }
        return Optional.empty();
    }

    // Sync task with Google Calendar manually
    public Optional<Task> syncTaskWithCalendar(String taskId, String userId) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();

            if (!task.getSyncWithCalendar() || task.getDueDate() == null) {
                throw new IllegalArgumentException("Task must have calendar sync enabled and due date set");
            }

            try {
                String eventId = null;

                // If task already has calendar event, update it
                if (task.getGoogleCalendarEventId() != null && !task.getGoogleCalendarEventId().isEmpty()) {
                    boolean updated = googleCalendarService.updateCalendarEvent(task, userId);
                    if (updated) {
                        return Optional.of(task);
                    } else {
                        // Update failed, try to create new event
                        eventId = googleCalendarService.createCalendarEvent(task, userId);
                    }
                } else {
                    // Create new calendar event
                    eventId = googleCalendarService.createCalendarEvent(task, userId);
                }

                if (eventId != null && !eventId.isEmpty()) {
                    task.setGoogleCalendarEventId(eventId);
                    return Optional.of(taskRepository.save(task));
                }

            } catch (Exception e) {
                throw new RuntimeException("Failed to sync with Google Calendar: " + e.getMessage());
            }
        }
        return Optional.empty();
    }

    // Bulk sync tasks with calendar
    public Map<String, Object> syncAllTasksWithCalendar(String userId) {
        List<Task> tasksToSync = taskRepository.findByUserIdAndSyncWithCalendarTrue(userId);
        Map<String, Object> result = new HashMap<>();

        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();

        for (Task task : tasksToSync) {
            if (task.getDueDate() == null) {
                continue; // Skip tasks without due date
            }

            try {
                syncTaskWithCalendar(task.getId(), userId);
                successCount++;
            } catch (Exception e) {
                failureCount++;
                errors.add("Task '" + task.getTitle() + "': " + e.getMessage());
            }
        }

        result.put("totalTasks", tasksToSync.size());
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("errors", errors);

        return result;
    }

    // Get calendar event details for task
    public Map<String, Object> getTaskCalendarEvent(String taskId, String userId) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            if (task.getGoogleCalendarEventId() != null && !task.getGoogleCalendarEventId().isEmpty()) {
                try {
                    return googleCalendarService.getCalendarEvent(task.getGoogleCalendarEventId(), userId);
                } catch (Exception e) {
                    throw new RuntimeException("Failed to get calendar event: " + e.getMessage());
                }
            }
        }
        return null;
    }

    // ============= TASK ANALYTICS & VALIDATION =============

    /**
     * Get task analytics for dashboard
     */
    public Map<String, Object> getTaskAnalytics(String userId) {
        List<Task> allTasks = taskRepository.findByUserId(userId);

        Map<String, Object> analytics = new HashMap<>();

        // Basic counts
        analytics.put("totalTasks", allTasks.size());
        analytics.put("completedTasks",
                allTasks.stream().mapToLong(t -> t.getStatus() == Task.TaskStatus.COMPLETED ? 1 : 0).sum());
        analytics.put("inProgressTasks",
                allTasks.stream().mapToLong(t -> t.getStatus() == Task.TaskStatus.IN_PROGRESS ? 1 : 0).sum());
        analytics.put("todoTasks",
                allTasks.stream().mapToLong(t -> t.getStatus() == Task.TaskStatus.TODO ? 1 : 0).sum());

        // Due date analytics
        analytics.put("overdueTasks", allTasks.stream().mapToLong(t -> t.isOverdue() ? 1 : 0).sum());
        analytics.put("dueSoonTasks", allTasks.stream().mapToLong(t -> t.isDueSoon() ? 1 : 0).sum());
        analytics.put("tasksWithDueDate", allTasks.stream().mapToLong(t -> t.getDueDate() != null ? 1 : 0).sum());

        // SubTask analytics
        int totalSubTasks = allTasks.stream().mapToInt(Task::getSubTasksCount).sum();
        int completedSubTasks = allTasks.stream().mapToInt(Task::getCompletedSubTasksCount).sum();
        analytics.put("totalSubTasks", totalSubTasks);
        analytics.put("completedSubTasks", completedSubTasks);
        analytics.put("subTaskCompletionRate",
                totalSubTasks > 0 ? (double) completedSubTasks / totalSubTasks * 100 : 0);

        // Calendar integration analytics
        analytics.put("calendarSyncedTasks",
                allTasks.stream().mapToLong(t -> t.hasCalendarIntegration() ? 1 : 0).sum());
        analytics.put("tasksNeedingSync", allTasks.stream().mapToLong(t -> t.needsCalendarSync() ? 1 : 0).sum());

        // Completion trends (last 7 days)
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        long recentCompletions = allTasks.stream()
                .mapToLong(t -> t.getCompletedAt() != null && t.getCompletedAt().isAfter(oneWeekAgo) ? 1 : 0)
                .sum();
        analytics.put("recentCompletions", recentCompletions);

        return analytics;
    }

    /**
     * Get tasks due today
     */
    public List<Task> getTasksDueToday(String userId) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusSeconds(1);
        return taskRepository.findByUserIdAndDueDateBetween(userId, startOfDay, endOfDay);
    }

    /**
     * Get tasks due this week
     */
    public List<Task> getTasksDueThisWeek(String userId) {
        LocalDateTime startOfWeek = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusWeeks(1);
        return taskRepository.findByUserIdAndDueDateBetween(userId, startOfWeek, endOfWeek);
    }

    /**
     * Auto-complete task based on subtasks completion
     */
    public Optional<Task> autoUpdateTaskStatus(String taskId, String userId) {
        Optional<Task> taskOpt = taskRepository.findByIdAndUserId(taskId, userId);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            Task.TaskStatus oldStatus = task.getStatus();
            task.updateStatusFromSubTasks();

            // Only save if status changed
            if (task.getStatus() != oldStatus) {
                return Optional.of(taskRepository.save(task));
            }
            return taskOpt;
        }
        return Optional.empty();
    }

    /**
     * Validate task data before save
     */
    public List<String> validateTask(Task task) {
        List<String> errors = new ArrayList<>();

        // Validate due date
        if (task.getDueDate() != null && !task.isValidDueDate()) {
            errors.add("Due date cannot be more than 5 minutes in the past");
        }

        // Validate subtasks
        if (task.getSubTasks() != null) {
            for (int i = 0; i < task.getSubTasks().size(); i++) {
                Task.SubTask subTask = task.getSubTasks().get(i);
                if (subTask.getDueDate() != null && !subTask.isValidDueDate()) {
                    errors.add("SubTask " + (i + 1) + " due date cannot be more than 5 minutes in the past");
                }

                // Check if subtask due date is after main task due date
                if (task.getDueDate() != null && subTask.getDueDate() != null &&
                        subTask.getDueDate().isAfter(task.getDueDate())) {
                    errors.add("SubTask " + (i + 1) + " due date cannot be after main task due date");
                }
            }
        }

        return errors;
    }
}
