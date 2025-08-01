package com.workify.backend.repository;

import com.workify.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    /**
     * Tìm tất cả thông báo của user
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Tìm thông báo chưa đọc của user
     */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);

    /**
     * Tìm thông báo đã đọc của user
     */
    List<Notification> findByUserIdAndIsReadTrueOrderByCreatedAtDesc(String userId);

    /**
     * Tìm thông báo theo type của user
     */
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, Notification.NotificationType type);

    /**
     * Tìm thông báo liên quan đến task cụ thể
     */
    List<Notification> findByUserIdAndTaskIdOrderByCreatedAtDesc(String userId, String taskId);

    /**
     * Đếm số thông báo chưa đọc của user
     */
    long countByUserIdAndIsReadFalse(String userId);

    /**
     * Tìm thông báo TASK_DUE_SOON của user trong khoảng thời gian
     */
    @Query("{ 'userId': ?0, 'type': 'TASK_DUE_SOON', 'taskId': ?1, 'createdAt': { '$gte': ?2 } }")
    List<Notification> findTaskDueSoonNotifications(String userId, String taskId, LocalDateTime since);

    /**
     * Xóa thông báo cũ hơn số ngày nhất định
     */
    void deleteByCreatedAtBefore(LocalDateTime before);

    /**
     * Tìm thông báo trong khoảng thời gian
     */
    List<Notification> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(String userId, LocalDateTime start, LocalDateTime end);

    /**
     * Tìm thông báo type TASK_DUE_SOON cho task cụ thể trong vòng 24h gần nhất
     * Để tránh tạo duplicate notification
     */
    @Query("{ 'userId': ?0, 'taskId': ?1, 'type': 'TASK_DUE_SOON', 'createdAt': { '$gte': ?2 } }")
    List<Notification> findRecentTaskDueNotifications(String userId, String taskId, LocalDateTime since);

    /**
     * Tìm thông báo type TASK_OVERDUE cho task cụ thể trong vòng 24h gần nhất
     * Để tránh tạo duplicate notification
     */
    @Query("{ 'userId': ?0, 'taskId': ?1, 'type': 'TASK_OVERDUE', 'createdAt': { '$gte': ?2 } }")
    List<Notification> findRecentTaskOverdueNotifications(String userId, String taskId, LocalDateTime since);
}
