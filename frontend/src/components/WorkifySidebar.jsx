import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const WorkifySidebar = () => {
  const location = useLocation()

  const menuItems = [
    {
      path: '/workify/dashboard',
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      description: 'Tổng quan'
    },
    {
      path: '/workify/mail',
      icon: 'bi-envelope',
      label: 'Hộp thư đến',
      description: 'Quản lý email'
    },
    {
      path: '/workify/meetings',
      icon: 'bi-camera-video',
      label: 'Cuộc họp',
      description: 'Quản lý cuộc họp'
    },
    {
      path: '/workify/tags',
      icon: 'bi-tags',
      label: 'Tags',
      description: 'Quản lý nhãn'
    },
    {
      path: '/workify/templates',
      icon: 'bi-layout-text-window-reverse',
      label: 'Mẫu thiết kế',
      description: 'Quản lý template'
    },
    {
      path: '/workify/tasks',
      icon: 'bi-check2-square',
      label: 'Nhiệm vụ',
      description: 'Quản lý công việc'
    },
    {
      path: '/workify/notes',
      icon: 'bi-journal-text',
      label: 'Ghi chú',
      description: 'Tạo và quản lý note'
    },
    {
      path: '/workify/recordings',
      icon: 'bi-mic',
      label: 'Ghi âm',
      description: 'Quản lý bản ghi âm'
    },
    {
      path: '/workify/notifications',
      icon: 'bi-bell',
      label: 'Thông báo',
      description: 'Xem thông báo'
    },
    {
      path: '/workify/calendar',
      icon: 'bi-calendar3',
      label: 'Lịch',
      description: 'Lập kế hoạch'
    },
    {
      path: '/workify/workspaces',
      icon: 'bi-people',
      label: 'Nhóm',
      description: 'Không gian làm việc'
    }
  ]

  return (
    <aside className="workify-sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <div className="sidebar-icon">
                <i className={`bi ${item.icon}`}></i>
              </div>
              <div className="sidebar-text">
                <div className="sidebar-label">{item.label}</div>
                <div className="sidebar-description">{item.description}</div>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default WorkifySidebar
