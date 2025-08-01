import React, { useState, useEffect } from 'react';
import { 
  IoNotifications, 
  IoCheckmarkDone, 
  IoTrash, 
  IoTime, 
  IoAlert, 
  IoCheckmarkCircle,
  IoPersonAdd,
  IoInformationCircle,
  IoRefresh,
  IoFilterOutline,
  IoSearchOutline
} from 'react-icons/io5';
import notificationService from '../services/notificationService';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read', 'due-soon', 'overdue', 'assigned'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    dueSoon: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let response;
      switch (filter) {
        case 'unread':
          response = await notificationService.getUnreadNotifications();
          break;
        case 'read':
          response = await notificationService.getReadNotifications();
          break;
        case 'due-soon':
          response = await notificationService.getNotificationsByType('TASK_DUE_SOON');
          break;
        case 'overdue':
          response = await notificationService.getNotificationsByType('TASK_OVERDUE');
          break;
        case 'assigned':
          response = await notificationService.getNotificationsByType('TASK_ASSIGNED');
          break;
        default:
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

  const fetchStats = async () => {
    try {
      const [allResponse, unreadResponse, dueSoonResponse, overdueResponse] = await Promise.all([
        notificationService.getAllNotifications(),
        notificationService.getUnreadNotifications(),
        notificationService.getNotificationsByType('TASK_DUE_SOON'),
        notificationService.getNotificationsByType('TASK_OVERDUE')
      ]);

      setStats({
        total: allResponse.success ? allResponse.count : 0,
        unread: unreadResponse.success ? unreadResponse.count : 0,
        dueSoon: dueSoonResponse.success ? dueSoonResponse.count : 0,
        overdue: overdueResponse.success ? overdueResponse.count : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        fetchStats();
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
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!window.confirm('Đánh dấu tất cả thông báo đã đọc?')) return;
    
    setLoading(true);
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        fetchNotifications();
        fetchStats();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa TẤT CẢ thông báo? Hành động này không thể hoàn tác!')) return;
    
    setLoading(true);
    try {
      const response = await notificationService.deleteAllNotifications();
      if (response.success) {
        setNotifications([]);
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const response = await notificationService.createGeneralNotification(
        'Test Notification',
        'Đây là thông báo test từ hệ thống'
      );
      if (response.success) {
        fetchNotifications();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
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
    return date.toLocaleString('vi-VN');
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notifications-page">
      <div className="container-fluid">
        <div className="notifications-header">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="page-title">
                <IoNotifications className="me-3" />
                Thông báo
              </h2>
              <p className="text-muted">Quản lý tất cả thông báo của bạn</p>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary"
                onClick={fetchNotifications}
                disabled={loading}
              >
                <IoRefresh className="me-2" />
                Làm mới
              </button>
              <button 
                className="btn btn-success"
                onClick={handleMarkAllAsRead}
                disabled={loading || stats.unread === 0}
              >
                <IoCheckmarkDone className="me-2" />
                Đọc tất cả
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteAll}
                disabled={loading || stats.total === 0}
              >
                <IoTrash className="me-2" />
                Xóa tất cả
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="stat-card">
                <div className="stat-icon total">
                  <IoNotifications />
                </div>
                <div className="stat-content">
                  <h3>{stats.total}</h3>
                  <p>Tổng thông báo</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="stat-card">
                <div className="stat-icon unread">
                  <IoCheckmarkCircle />
                </div>
                <div className="stat-content">
                  <h3>{stats.unread}</h3>
                  <p>Chưa đọc</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="stat-card">
                <div className="stat-icon due-soon">
                  <IoTime />
                </div>
                <div className="stat-content">
                  <h3>{stats.dueSoon}</h3>
                  <p>Sắp đến hạn</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="stat-card">
                <div className="stat-icon overdue">
                  <IoAlert />
                </div>
                <div className="stat-content">
                  <h3>{stats.overdue}</h3>
                  <p>Quá hạn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Tất cả ({stats.total})
                </button>
                <button 
                  className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                  onClick={() => setFilter('unread')}
                >
                  Chưa đọc ({stats.unread})
                </button>
                <button 
                  className={`filter-btn ${filter === 'due-soon' ? 'active' : ''}`}
                  onClick={() => setFilter('due-soon')}
                >
                  Sắp đến hạn ({stats.dueSoon})
                </button>
                <button 
                  className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
                  onClick={() => setFilter('overdue')}
                >
                  Quá hạn ({stats.overdue})
                </button>
                <button 
                  className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
                  onClick={() => setFilter('assigned')}
                >
                  Được giao
                </button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="search-box">
                <IoSearchOutline className="search-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm thông báo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-content">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Đang tải thông báo...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <IoCheckmarkCircle className="empty-icon" />
              <h4>Không có thông báo nào</h4>
              <p className="text-muted">
                {searchTerm ? 'Không tìm thấy thông báo phù hợp' : 'Bạn không có thông báo nào trong danh mục này'}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-card-content">
                    <div className="notification-icon-wrapper">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="notification-body">
                      <h5 className="notification-title">{notification.title}</h5>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <small className="text-muted">
                          Tạo lúc: {formatDate(notification.createdAt)}
                        </small>
                        {notification.isRead && notification.readAt && (
                          <small className="text-muted ms-3">
                            Đã đọc: {formatDate(notification.readAt)}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="notification-actions">
                      {!notification.isRead && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={actionLoading[notification.id]}
                          title="Đánh dấu đã đọc"
                        >
                          <IoCheckmarkDone />
                        </button>
                      )}
                      
                      <button
                        className="btn btn-sm btn-outline-danger"
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
