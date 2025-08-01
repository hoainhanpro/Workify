import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('workify_access_token');
};

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ auto-logout khi chắc chắn là token invalid, không phải lỗi server
    if (error.response?.status === 401 && error.response?.data?.message?.includes('token')) {
      // Token expired or invalid - clear all auth data
      localStorage.removeItem('workify_access_token');
      localStorage.removeItem('workify_refresh_token');
      localStorage.removeItem('workify_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

const notificationService = {
  // Lấy tất cả thông báo
  getAllNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Lấy thông báo chưa đọc
  getUnreadNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications/unread');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  // Đếm số thông báo chưa đọc
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Xóa thông báo
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Xóa tất cả thông báo
  deleteAllNotifications: async () => {
    try {
      const response = await apiClient.delete('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  },

  // Lấy thông báo theo loại
  getNotificationsByType: async (type) => {
    try {
      const response = await apiClient.get(`/notifications/type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      throw error;
    }
  },

  // Lấy thông báo theo task
  getNotificationsByTask: async (taskId) => {
    try {
      const response = await apiClient.get(`/notifications/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by task:', error);
      throw error;
    }
  },

  // Kiểm tra thông báo thủ công (để test)
  checkManually: async () => {
    try {
      const response = await apiClient.post('/notifications/check-manually');
      return response.data;
    } catch (error) {
      console.error('Error running manual check:', error);
      throw error;
    }
  },

  // Tạo thông báo tổng quát (để test)
  createGeneralNotification: async (title, message) => {
    try {
      const response = await apiClient.post('/notifications/create-general', {
        title,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error creating general notification:', error);
      throw error;
    }
  }
};

export default notificationService;
