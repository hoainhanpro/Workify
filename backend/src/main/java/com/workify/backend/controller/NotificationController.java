package com.workify.backend.controller;

import com.workify.backend.dto.NotificationResponse;
import com.workify.backend.model.Notification;
import com.workify.backend.model.Task;
import com.workify.backend.repository.TaskRepository;
import com.workify.backend.security.SecurityUtils;
import com.workify.backend.service.NotificationService;
import com.workify.backend.service.TaskNotificationScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasRole('USER')")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TaskNotificationScheduler taskNotificationScheduler;

    @Autowired
    private TaskRepository taskRepository;

    /**
     * Lấy tất cả thông báo của user hiện tại
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllNotifications() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Notification> notifications = notificationService.getAllNotifications(userId);
            List<NotificationResponse> notificationResponses = notifications.stream()
                    .map(NotificationResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", notificationResponses);
            response.put("count", notificationResponses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve notifications: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thông báo chưa đọc của user hiện tại
     */
    @GetMapping("/unread")
    public ResponseEntity<Map<String, Object>> getUnreadNotifications() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            List<NotificationResponse> notificationResponses = notifications.stream()
                    .map(NotificationResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", notificationResponses);
            response.put("count", notificationResponses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve unread notifications: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            long unreadCount = notificationService.getUnreadCount(userId);

            response.put("success", true);
            response.put("count", unreadCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get unread count: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thông báo đã đọc của user hiện tại
     */
    @GetMapping("/read")
    public ResponseEntity<Map<String, Object>> getReadNotifications() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Notification> notifications = notificationService.getReadNotifications(userId);
            List<NotificationResponse> notificationResponses = notifications.stream()
                    .map(NotificationResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", notificationResponses);
            response.put("count", notificationResponses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve read notifications: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Test endpoint - Kiểm tra tasks sắp đến hạn và debug với chi tiết time
     */
    @PostMapping("/debug-due-soon")
    public ResponseEntity<Map<String, Object>> debugTasksDueSoon() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            
            // Lấy tất cả task chưa hoàn thành
            List<Task> tasks = taskRepository.findByUserIdAndStatusNot(userId, Task.TaskStatus.COMPLETED);
            
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime now24h = now.plusDays(1);
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("totalTasks", tasks.size());
            debugInfo.put("currentTime", now);
            debugInfo.put("next24Hours", now24h);
            
            List<Map<String, Object>> taskDetails = new ArrayList<>();
            int dueSoonCount = 0;
            int overdueCount = 0;
            
            for (Task task : tasks) {
                Map<String, Object> taskInfo = new HashMap<>();
                taskInfo.put("id", task.getId());
                taskInfo.put("title", task.getTitle());
                taskInfo.put("dueDate", task.getDueDate());
                taskInfo.put("status", task.getStatus());
                
                // Manual check logic để debug
                boolean manualIsDueSoon = false;
                boolean manualIsOverdue = false;
                String timeAnalysis = "";
                
                if (task.getDueDate() != null) {
                    if (task.getDueDate().isBefore(now)) {
                        manualIsOverdue = true;
                        timeAnalysis = "OVERDUE: " + java.time.Duration.between(task.getDueDate(), now).toHours() + " hours ago";
                    } else if (task.getDueDate().isBefore(now24h)) {
                        manualIsDueSoon = true;
                        timeAnalysis = "DUE SOON: " + java.time.Duration.between(now, task.getDueDate()).toHours() + " hours left";
                    } else {
                        timeAnalysis = "FUTURE: " + java.time.Duration.between(now, task.getDueDate()).toDays() + " days left";
                    }
                } else {
                    timeAnalysis = "NO DUE DATE";
                }
                
                taskInfo.put("timeAnalysis", timeAnalysis);
                taskInfo.put("manualIsDueSoon", manualIsDueSoon);
                taskInfo.put("manualIsOverdue", manualIsOverdue);
                taskInfo.put("modelIsDueSoon", task.isDueSoon());
                taskInfo.put("modelIsOverdue", task.isOverdue());
                
                if (task.isDueSoon() || manualIsDueSoon) {
                    dueSoonCount++;
                    // Thử tạo thông báo
                    try {
                        notificationService.checkAndCreateTaskDueSoonNotification(userId, task);
                        taskInfo.put("notificationAttempt", "SUCCESS - notification created");
                    } catch (Exception e) {
                        taskInfo.put("notificationAttempt", "FAILED: " + e.getMessage());
                    }
                }
                
                if (task.isOverdue() || manualIsOverdue) {
                    overdueCount++;
                }
                
                taskDetails.add(taskInfo);
            }
            
            debugInfo.put("dueSoonCount", dueSoonCount);
            debugInfo.put("overdueCount", overdueCount);
            debugInfo.put("taskDetails", taskDetails);
            
            response.put("success", true);
            response.put("data", debugInfo);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Debug failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Đánh dấu thông báo đã đọc
     */
    @PutMapping("/{notificationId}/mark-read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable String notificationId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Optional<Notification> notification = notificationService.markAsRead(notificationId, userId);

            if (notification.isPresent()) {
                response.put("success", true);
                response.put("message", "Notification marked as read");
                response.put("data", new NotificationResponse(notification.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Notification not found or you don't have permission to modify it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to mark notification as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            int markedCount = notificationService.markAllAsRead(userId);

            response.put("success", true);
            response.put("message", "All notifications marked as read");
            response.put("markedCount", markedCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to mark all notifications as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Xóa thông báo cụ thể
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable String notificationId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            boolean deleted = notificationService.deleteNotification(notificationId, userId);

            if (deleted) {
                response.put("success", true);
                response.put("message", "Notification deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Notification not found or you don't have permission to delete it");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete notification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Xóa tất cả thông báo của user
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteAllNotifications() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            int deletedCount = notificationService.deleteAllNotifications(userId);

            response.put("success", true);
            response.put("message", "All notifications deleted successfully");
            response.put("deletedCount", deletedCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete all notifications: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thông báo theo loại
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<Map<String, Object>> getNotificationsByType(@PathVariable Notification.NotificationType type) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Notification> notifications = notificationService.getNotificationsByType(userId, type);
            List<NotificationResponse> notificationResponses = notifications.stream()
                    .map(NotificationResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", notificationResponses);
            response.put("count", notificationResponses.size());
            response.put("type", type);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve notifications by type: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thông báo liên quan đến task cụ thể
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<Map<String, Object>> getNotificationsByTask(@PathVariable String taskId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            List<Notification> notifications = notificationService.getNotificationsByTask(userId, taskId);
            List<NotificationResponse> notificationResponses = notifications.stream()
                    .map(NotificationResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", notificationResponses);
            response.put("count", notificationResponses.size());
            response.put("taskId", taskId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve notifications by task: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Kiểm tra thông báo task thủ công (để test)
     */
    @PostMapping("/check-manually")
    public ResponseEntity<Map<String, Object>> checkNotificationsManually() {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            
            // Kiểm tra task của user hiện tại
            notificationService.checkAllUserTasksForNotifications(userId);
            
            // Hoặc chạy scheduled task cho tất cả user
            taskNotificationScheduler.runTaskNotificationCheckManually();

            response.put("success", true);
            response.put("message", "Manual notification check completed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to run manual notification check: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Tạo thông báo general (để test)
     */
    @PostMapping("/create-general")
    public ResponseEntity<Map<String, Object>> createGeneralNotification(
            @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = SecurityUtils.getCurrentUserId();
            String title = request.get("title");
            String message = request.get("message");
            
            Notification notification = notificationService.createGeneralNotification(userId, title, message);
            
            response.put("success", true);
            response.put("message", "General notification created successfully");
            response.put("data", new NotificationResponse(notification));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create general notification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
