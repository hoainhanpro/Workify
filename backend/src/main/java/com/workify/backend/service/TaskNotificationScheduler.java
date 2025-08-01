package com.workify.backend.service;

import com.workify.backend.model.Task;
import com.workify.backend.model.User;
import com.workify.backend.repository.TaskRepository;
import com.workify.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskNotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TaskNotificationScheduler.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Scheduled task chạy mỗi 1 phút để kiểm tra task sắp đến hạn (test faster)
     * Sử dụng fixedRate = 1 * 60 * 1000 milliseconds = 1 phút
     */
    @Scheduled(fixedRate = 1 * 60 * 1000) // 1 phút để test nhanh hơn
    public void checkTasksDueSoon() {
        logger.info("Bắt đầu kiểm tra task sắp đến hạn...");

        try {
            // Lấy tất cả user trong hệ thống (bỏ enabled check)
            List<User> allUsers = userRepository.findAll();
            logger.info("Tìm thấy {} users trong hệ thống", allUsers.size());

            int totalTasksChecked = 0;
            int notificationsCreated = 0;

            for (User user : allUsers) {
                try {
                    // Lấy tất cả task chưa hoàn thành của user sử dụng username
                    List<Task> userTasks = taskRepository.findByUserIdAndStatusNot(user.getUsername(), Task.TaskStatus.COMPLETED);
                    totalTasksChecked += userTasks.size();

                    for (Task task : userTasks) {
                        try {
                            // Bỏ qua task không có dueDate
                            if (task.getDueDate() == null) {
                                continue;
                            }
                            
                            // Kiểm tra và tạo thông báo nếu cần thiết sử dụng username
                            notificationService.checkAndCreateTaskDueSoonNotification(user.getUsername(), task);
                            notificationService.checkAndCreateTaskOverdueNotification(user.getUsername(), task);
                            
                            notificationsCreated++; // Đơn giản hóa counting

                        } catch (Exception e) {
                            logger.error("Lỗi khi kiểm tra task {} của user {}: {}", 
                                    task.getId(), user.getUsername(), e.getMessage());
                        }
                    }

                } catch (Exception e) {
                    logger.error("Lỗi khi kiểm tra tasks của user {}: {}", user.getUsername(), e.getMessage());
                }
            }

            logger.info("Hoàn thành kiểm tra task sắp đến hạn. " +
                    "Đã kiểm tra {} users, {} tasks. Tạo {} thông báo mới.", 
                    allUsers.size(), totalTasksChecked, notificationsCreated);

        } catch (Exception e) {
            logger.error("Lỗi trong quá trình kiểm tra task sắp đến hạn: {}", e.getMessage(), e);
        }
    }

    /**
     * Scheduled task chạy mỗi ngày lúc 2:00 AM để dọn dẹp thông báo cũ
     * Xóa thông báo cũ hơn 30 ngày
     */
    @Scheduled(cron = "0 0 2 * * ?") // 2:00 AM mỗi ngày
    public void cleanupOldNotifications() {
        logger.info("Bắt đầu dọn dẹp thông báo cũ...");

        try {
            notificationService.cleanupOldNotifications(30); // Xóa thông báo cũ hơn 30 ngày
            logger.info("Hoàn thành dọn dẹp thông báo cũ");

        } catch (Exception e) {
            logger.error("Lỗi trong quá trình dọn dẹp thông báo cũ: {}", e.getMessage(), e);
        }
    }

    /**
     * Scheduled task chạy mỗi giờ để kiểm tra task quá hạn
     */
    @Scheduled(fixedRate = 60 * 60 * 1000) // 1 giờ
    public void checkOverdueTasks() {
        logger.info("Bắt đầu kiểm tra task quá hạn...");

        try {
            List<User> activeUsers = userRepository.findByEnabled(true);
            int totalOverdueChecked = 0;
            int overdueNotificationsCreated = 0;

            for (User user : activeUsers) {
                try {
                    // Lấy tất cả task quá hạn của user sử dụng username
                    List<Task> overdueTasks = taskRepository.findOverdueTasksByUserId(user.getUsername(), LocalDateTime.now());
                    totalOverdueChecked += overdueTasks.size();

                    for (Task task : overdueTasks) {
                        try {
                            int notificationsBefore = notificationService.getUnreadNotifications(user.getUsername()).size();
                            notificationService.checkAndCreateTaskOverdueNotification(user.getUsername(), task);
                            int notificationsAfter = notificationService.getUnreadNotifications(user.getUsername()).size();
                            overdueNotificationsCreated += (notificationsAfter - notificationsBefore);

                        } catch (Exception e) {
                            logger.error("Lỗi khi tạo thông báo quá hạn cho task {} của user {}: {}", 
                                    task.getId(), user.getUsername(), e.getMessage());
                        }
                    }

                } catch (Exception e) {
                    logger.error("Lỗi khi kiểm tra task quá hạn của user {}: {}", user.getUsername(), e.getMessage());
                }
            }

            logger.info("Hoàn thành kiểm tra task quá hạn. " +
                    "Đã kiểm tra {} users, {} task quá hạn. Tạo {} thông báo quá hạn.", 
                    activeUsers.size(), totalOverdueChecked, overdueNotificationsCreated);

        } catch (Exception e) {
            logger.error("Lỗi trong quá trình kiểm tra task quá hạn: {}", e.getMessage(), e);
        }
    }

    /**
     * Method để test scheduled task manually (có thể gọi từ controller)
     */
    public void runTaskNotificationCheckManually() {
        logger.info("Chạy kiểm tra thông báo task theo cách thủ công");
        checkTasksDueSoon();
    }

    /**
     * Method để test cleanup manually
     */
    public void runCleanupManually() {
        logger.info("Chạy dọn dẹp thông báo theo cách thủ công");
        cleanupOldNotifications();
    }
}
