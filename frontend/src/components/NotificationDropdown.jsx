import React, { useState, useEffect } from 'react';
import { 
  IoCheckmarkDone, 
  IoTrash, 
  IoTime, 
  IoAlert, 
  IoCheckmarkCircle,
  IoPersonAdd,
  IoInformationCircle,
  IoClose,
  IoRefresh
} from 'react-icons/io5';
import notificationService from '../services/notificationService';
import './NotificationDropdown.css';

const NotificationDropdown = ({ onClose, onUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unread'); // 'unread', 'all'
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'unread') {
        response = await notificationService.getUnreadNotifications();
      } else {
        response = await notificationService.getAllNotifications();
      }
      
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    setActionLoading(prev => ({ ...prev, [notificationId]: true }));
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          )
        );
        onUpdate();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    
    setActionLoading(prev => ({ ...prev, [notificationId]: true }));
    try {
      const response = await notificationService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        fetchNotifications();
        onUpdate();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) return;
    
    setLoading(true);
    try {
      const response = await notificationService.deleteAllNotifications();
      if (response.success) {
        setNotifications([]);
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_DUE_SOON':
        return <IoTime className="notification-type-icon due-soon" />;
      case 'TASK_OVERDUE':
        return <IoAlert className="notification-type-icon overdue" />;
      case 'TASK_ASSIGNED':
        return <IoPersonAdd className="notification-type-icon assigned" />;
      case 'WORKSPACE_INVITATION':
        return <IoPersonAdd className="notification-type-icon invitation" />;
      case 'GENERAL':
      default:
        return <IoInformationCircle className="notification-type-icon general" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h6 className="notification-title">Thông báo</h6>
        <button className="btn-close-dropdown" onClick={onClose}>
          <IoClose />
        </button>
      </div>

      <div className="notification-tabs">
        <button 
          className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Chưa đọc
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả
        </button>
      </div>

      <div className="notification-actions">
        <div className="actions-group">
          <button 
            className="action-btn refresh"
            onClick={fetchNotifications}
            disabled={loading}
            title="Làm mới"
          >
            <IoRefresh />
            <span>Làm mới</span>
          </button>
          
          <button 
            className="action-btn mark-read"
            onClick={handleMarkAllAsRead}
            disabled={loading || notifications.length === 0}
            title="Đánh dấu tất cả đã đọc"
          >
            <IoCheckmarkDone />
            <span>Đánh dấu đã đọc</span>
          </button>
          
          <button 
            className="action-btn delete"
            onClick={handleDeleteAll}
            disabled={loading || notifications.length === 0}
            title="Xóa tất cả thông báo"
          >
            <IoTrash />
            <span>Xóa tất cả</span>
          </button>
        </div>
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="notification-loading">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2">Đang tải...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <IoCheckmarkCircle className="empty-icon" />
            <p>Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-body">
                  <h6 className="notification-item-title">{notification.title}</h6>
                  <p className="notification-message">{notification.message}</p>
                  <small className="notification-time">
                    {formatDate(notification.createdAt)}
                  </small>
                </div>

                <div className="notification-actions-item">
                  {!notification.isRead && (
                    <button
                      className="btn-action"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={actionLoading[notification.id]}
                      title="Đánh dấu đã đọc"
                    >
                      <IoCheckmarkDone />
                    </button>
                  )}
                  
                  <button
                    className="btn-action delete"
                    onClick={() => handleDelete(notification.id)}
                    disabled={actionLoading[notification.id]}
                    title="Xóa thông báo"
                  >
                    <IoTrash />
                  </button>
                </div>
              </div>
              
              {!notification.isRead && <div className="unread-indicator"></div>}
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notification-footer">
          <small className="text-muted">
            Tổng: {notifications.length} thông báo
          </small>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
