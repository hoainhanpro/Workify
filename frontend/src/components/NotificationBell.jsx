import React, { useState, useEffect, useRef } from 'react';
import { IoNotifications, IoNotificationsOutline } from 'react-icons/io5';
import notificationService from '../services/notificationService';
import NotificationDropdown from './NotificationDropdown';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count khi component mount
  useEffect(() => {
    fetchUnreadCount();
    
    // Polling mỗi 30 giây để update count
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      // Chỉ log lỗi, không crash app
      console.error('Error fetching unread count:', error);
      
      // Nếu là 404 (endpoint chưa có) hoặc 500 (server error), reset count về 0
      if (error.response?.status === 404 || error.response?.status === 500) {
        setUnreadCount(0);
      }
      
      // Không auto-logout trừ khi chắc chắn là token invalid
      return;
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNotificationUpdate = () => {
    // Callback từ dropdown khi có thay đổi
    fetchUnreadCount();
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="notification-bell-btn"
        onClick={handleBellClick}
        disabled={loading}
      >
        {unreadCount > 0 ? (
          <IoNotifications className="notification-icon active" />
        ) : (
          <IoNotificationsOutline className="notification-icon" />
        )}
        
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown 
          onClose={() => setShowDropdown(false)}
          onUpdate={handleNotificationUpdate}
        />
      )}
    </div>
  );
};

export default NotificationBell;
