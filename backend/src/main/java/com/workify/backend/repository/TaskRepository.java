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

        // Find tasks by user ID and NOT status (for notification checking)
        List<Task> findByUserIdAndStatusNot(String userId, Task.TaskStatus status);

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
        List<Task> findByUserIdAndAdvancedSearch(String userId, String searchTerm, List<String> tags,
                        Task.TaskPriority priority);

        // Count tasks by user ID and status
        long countByUserIdAndStatus(String userId, Task.TaskStatus status);

        // Delete all tasks by user ID
        void deleteByUserId(String userId);

        // Find tasks by user ID and tag ID
        @Query("{ 'userId': ?0, 'tags': { $elemMatch: { $eq: ?1 } } }")
        List<Task> findByUserIdAndTagId(String userId, String tagId);

        // Calendar and due date queries
        @Query("{ 'userId': ?0, 'dueDate': { $gte: ?1, $lte: ?2 } }")
        List<Task> findByUserIdAndDueDateBetween(String userId, java.time.LocalDateTime from,
                        java.time.LocalDateTime to);

        @Query("{ 'userId': ?0, 'dueDate': { $lt: ?1 }, 'status': { $ne: 'COMPLETED' } }")
        List<Task> findOverdueTasksByUserId(String userId, java.time.LocalDateTime now);

        @Query("{ 'userId': ?0, 'syncWithCalendar': true }")
        List<Task> findByUserIdAndSyncWithCalendarTrue(String userId);

        @Query("{ 'userId': ?0, 'googleCalendarEventId': { $exists: true, $ne: null } }")
        List<Task> findByUserIdWithGoogleCalendarEventId(String userId);

        // ============= WORKSPACE RELATED QUERIES =============

        /**
         * Tìm tất cả personal tasks của user (không thuộc workspace nào)
         */
        @Query("{ 'userId': ?0, $or: [ { 'workspaceId': null }, { 'workspaceId': '' } ] }")
        List<Task> findPersonalTasksByUserId(String userId);

        /**
         * Tìm tất cả tasks trong workspace
         */
        List<Task> findByWorkspaceId(String workspaceId);

        /**
         * Tìm tasks trong workspace mà user có thể view
         * (owner, assigned, hoặc có trong shared permissions)
         */
        @Query("{ 'workspaceId': ?0, $or: [ " +
                        "{ 'userId': ?1 }, " +
                        "{ 'assignedToUserId': ?1 }, " +
                        "{ 'sharedPermissions.canView': ?1 }, " +
                        "{ 'sharedPermissions.canEdit': ?1 } " +
                        "] }")
        List<Task> findWorkspaceTasksVisibleToUser(String workspaceId, String userId);

        /**
         * Tìm tasks được assign cho user trong workspace
         */
        List<Task> findByWorkspaceIdAndAssignedToUserId(String workspaceId, String userId);

        /**
         * Tìm tasks mà user tạo trong workspace
         */
        List<Task> findByWorkspaceIdAndUserId(String workspaceId, String userId);

        /**
         * Tìm shared tasks trong workspace
         */
        List<Task> findByWorkspaceIdAndIsSharedToWorkspaceTrue(String workspaceId);

        /**
         * Đếm số tasks trong workspace
         */
        long countByWorkspaceId(String workspaceId);

        /**
         * Đếm số tasks được assign cho user trong workspace
         */
        long countByWorkspaceIdAndAssignedToUserId(String workspaceId, String userId);

        /**
         * Tìm task theo ID và kiểm tra user có quyền truy cập không
         */
        @Query("{ '_id': ?0, $or: [ " +
                        "{ 'userId': ?1 }, " +
                        "{ 'assignedToUserId': ?1 }, " +
                        "{ 'sharedPermissions.canView': ?1 }, " +
                        "{ 'sharedPermissions.canEdit': ?1 } " +
                        "] }")
        Optional<Task> findByIdAndUserHasAccess(String taskId, String userId);
}
