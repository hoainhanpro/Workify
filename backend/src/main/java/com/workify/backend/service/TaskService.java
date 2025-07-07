package com.workify.backend.service;

import com.workify.backend.model.Task;
import com.workify.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        return taskRepository.findByUserIdAndTitleOrDescriptionContaining(userId, searchTerm);
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
        public long getTotal() { return total; }
        public long getTodo() { return todo; }
        public long getInProgress() { return inProgress; }
        public long getCompleted() { return completed; }
    }
}
