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
      path: '/workify/calendar',
      icon: 'bi-calendar3',
      label: 'Lịch',
      description: 'Lập kế hoạch'
    },
    {
      path: '/workify/team',
      icon: 'bi-people',
      label: 'Nhóm',
      description: 'Cộng tác viên'
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
