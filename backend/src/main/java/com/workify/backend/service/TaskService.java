package com.workify.backend.service;

import com.workify.backend.model.Task;
import com.workify.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

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
    }

    // Create a new task
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    // Update an existing task
    public Optional<Task> updateTask(String taskId, String userId, Task updatedTask) {
        Optional<Task> existingTask = taskRepository.findByIdAndUserId(taskId, userId);
        if (existingTask.isPresent()) {
            Task task = existingTask.get();
            task.setTitle(updatedTask.getTitle());
            task.setDescription(updatedTask.getDescription());
            task.setStatus(updatedTask.getStatus());
            task.setPriority(updatedTask.getPriority());
            task.setTags(updatedTask.getTags());
            return Optional.of(taskRepository.save(task));
        }
        return Optional.empty();
    }

    // Delete a task
    public boolean deleteTask(String taskId, String userId) {
        Optional<Task> task = taskRepository.findByIdAndUserId(taskId, userId);
        if (task.isPresent()) {
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
}
