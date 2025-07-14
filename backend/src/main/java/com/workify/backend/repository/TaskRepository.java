package com.workify.backend.repository;

import com.workify.backend.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {

    // Find all tasks by user ID
    List<Task> findByUserId(String userId);

    // Find task by ID and user ID (for security)
    Optional<Task> findByIdAndUserId(String id, String userId);

    // Find tasks by user ID and status
    List<Task> findByUserIdAndStatus(String userId, Task.TaskStatus status);

    // Find tasks by user ID and priority
    List<Task> findByUserIdAndPriority(String userId, Task.TaskPriority priority);

    // Find tasks by user ID and tags containing
    List<Task> findByUserIdAndTagsContaining(String userId, String tag);

    // Find tasks by user ID with custom query for title or description
    @Query("{ 'userId': ?0, $or: [ { 'title': { $regex: ?1, $options: 'i' } }, { 'description': { $regex: ?1, $options: 'i' } } ] }")
    List<Task> findByUserIdAndTitleOrDescriptionContaining(String userId, String searchTerm);

    // Advanced search for title, description, tags, and priority
    @Query("{ 'userId': ?0, $or: [ " +
           "{ 'title': { $regex: ?1, $options: 'i' } }, " +
           "{ 'description': { $regex: ?1, $options: 'i' } }, " +
           "{ 'tags': { $in: ?2 } }, " +
           "{ 'priority': ?3 } ] }")
    List<Task> findByUserIdAndAdvancedSearch(String userId, String searchTerm, List<String> tags, Task.TaskPriority priority);

    // Count tasks by user ID and status
    long countByUserIdAndStatus(String userId, Task.TaskStatus status);

    // Delete all tasks by user ID
    void deleteByUserId(String userId);
}
