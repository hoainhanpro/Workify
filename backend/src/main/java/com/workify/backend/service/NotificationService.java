package com.workify.backend.service;

import com.workify.backend.model.Notification;
import com.workify.backend.model.Task;
import com.workify.backend.repository.NotificationRepository;
import com.workify.backend.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TaskRepository taskRepository;

    /**
     * Lấy tất cả thông báo của user
     */
    public List<Notification> getAllNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Lấy thông báo chưa đọc của user
     */
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    /**
     * Lấy thông báo đã đọc của user
     */
    public List<Notification> getReadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadTrueOrderByCreatedAtDesc(userId);
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Lấy thông báo theo ID
     */
    public Optional<Notification> getNotificationById(String notificationId, String userId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent() && notification.get().getUserId().equals(userId)) {
            return notification;
        }
        return Optional.empty();
    }

    /**
     * Đánh dấu thông báo đã đọc
     */
    public Optional<Notification> markAsRead(String notificationId, String userId) {
        Optional<Notification> notification = getNotificationById(notificationId, userId);
        if (notification.isPresent()) {
            notification.get().markAsRead();
            return Optional.of(notificationRepository.save(notification.get()));
        }
        return Optional.empty();
    }

    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    public int markAllAsRead(String userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.markAsRead();
        }
        notificationRepository.saveAll(unreadNotifications);
        return unreadNotifications.size();
    }

    /**
     * Xóa thông báo
     */
    public boolean deleteNotification(String notificationId, String userId) {
        Optional<Notification> notification = getNotificationById(notificationId, userId);
        if (notification.isPresent()) {
            notificationRepository.delete(notification.get());
            return true;
        }
        return false;
    }

    /**
     * Xóa tất cả thông báo của user
     */
    public int deleteAllNotifications(String userId) {
        List<Notification> notifications = getAllNotifications(userId);
        notificationRepository.deleteAll(notifications);
        return notifications.size();
    }

    /**
     * Tạo thông báo mới
     */
    public Notification createNotification(String userId, String title, String message, 
                                         Notification.NotificationType type, String taskId) {
        Notification notification = new Notification(userId, title, message, type, taskId);
        return notificationRepository.save(notification);
    }

    /**
     * Tạo thông báo mới (không có taskId)
     */
    public Notification createNotification(String userId, String title, String message, 
                                         Notification.NotificationType type) {
        Notification notification = new Notification(userId, title, message, type);
        return notificationRepository.save(notification);
    }

    /**
     * Kiểm tra task sắp đến hạn và tạo thông báo
     * Chỉ tạo nếu chưa có thông báo tương tự trong 24h gần đây
     */
    public void checkAndCreateTaskDueSoonNotification(String userId, Task task) {
        logger.debug("Kiểm tra task sắp đến hạn - Task: {}, User: {}, DueDate: {}", 
                    task.getTitle(), userId, task.getDueDate());
        
        // Kiểm tra task có sắp đến hạn không (trong vòng 24h tới)
        boolean isDueSoon = task.isDueSoon();
        logger.debug("Task '{}' isDueSoon: {}", task.getTitle(), isDueSoon);
        
        if (!isDueSoon) {
            return;
        }

        // Kiểm tra đã có thông báo tương tự trong 24h gần đây chưa
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        List<Notification> recentNotifications = notificationRepository
                .findRecentTaskDueNotifications(userId, task.getId(), last24Hours);

        logger.debug("Task '{}' có {} thông báo gần đây trong 24h", task.getTitle(), recentNotifications.size());

        if (!recentNotifications.isEmpty()) {
            logger.debug("Bỏ qua tạo thông báo cho task '{}' - đã có thông báo trong 24h", task.getTitle());
            return; // Đã có thông báo trong 24h gần đây, không tạo duplicate
        }

        // Tạo thông báo mới
        String title = "Task sắp đến hạn!";
        String message = String.format("Task '%s' sẽ đến hạn vào %s", 
                task.getTitle(), 
                task.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        logger.info("Tạo thông báo DUE_SOON cho task '{}' của user {}", task.getTitle(), userId);
        createNotification(userId, title, message, Notification.NotificationType.TASK_DUE_SOON, task.getId());
    }

    /**
     * Kiểm tra task quá hạn và tạo thông báo
     */
    public void checkAndCreateTaskOverdueNotification(String userId, Task task) {
        // Kiểm tra task có quá hạn không
        if (!task.isOverdue()) {
            return;
        }

        // Kiểm tra đã có thông báo overdue trong 24h gần đây chưa
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        List<Notification> recentOverdueNotifications = notificationRepository
                .findRecentTaskOverdueNotifications(userId, task.getId(), last24Hours);

        if (!recentOverdueNotifications.isEmpty()) {
            logger.debug("Bỏ qua tạo thông báo overdue cho task '{}' - đã có thông báo trong 24h", task.getTitle());
            return; // Đã có thông báo overdue trong 24h gần đây
        }

        // Tạo thông báo quá hạn
        String title = "Task quá hạn!";
        String message = String.format("Task '%s' đã quá hạn từ %s", 
                task.getTitle(), 
                task.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        logger.info("Tạo thông báo OVERDUE cho task '{}' của user {}", task.getTitle(), userId);
        createNotification(userId, title, message, Notification.NotificationType.TASK_OVERDUE, task.getId());
    }

    /**
     * Kiểm tra tất cả task của user và tạo thông báo cần thiết
     */
    public void checkAllUserTasksForNotifications(String userId) {
        // Lấy tất cả task chưa hoàn thành của user
        List<Task> userTasks = taskRepository.findByUserIdAndStatusNot(userId, Task.TaskStatus.COMPLETED);

        for (Task task : userTasks) {
            // Kiểm tra task sắp đến hạn
            checkAndCreateTaskDueSoonNotification(userId, task);
            
            // Kiểm tra task quá hạn
            checkAndCreateTaskOverdueNotification(userId, task);
        }
    }

    /**
     * Xóa thông báo cũ hơn số ngày nhất định
     */
    public void cleanupOldNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        notificationRepository.deleteByCreatedAtBefore(cutoffDate);
    }

    /**
     * Lấy thông báo theo loại
     */
    public List<Notification> getNotificationsByType(String userId, Notification.NotificationType type) {
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
    }

    /**
     * Lấy thông báo liên quan đến task cụ thể
     */
    public List<Notification> getNotificationsByTask(String userId, String taskId) {
        return notificationRepository.findByUserIdAndTaskIdOrderByCreatedAtDesc(userId, taskId);
    }

    /**
     * Tạo thông báo khi task được assign
     */
    public void createTaskAssignedNotification(String assigneeUserId, Task task, String assignerName) {
        String title = "Bạn được giao task mới!";
        String message = String.format("%s đã giao task '%s' cho bạn", assignerName, task.getTitle());
        
        createNotification(assigneeUserId, title, message, 
                         Notification.NotificationType.TASK_ASSIGNED, task.getId());
    }

    /**
     * Tạo thông báo chung
     */
    public Notification createGeneralNotification(String userId, String title, String message) {
        return createNotification(userId, title, message, Notification.NotificationType.GENERAL);
    }
}
