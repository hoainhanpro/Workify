import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const WorkifyNavbar = () => {
  const { user, logout } = useAuthContext()

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout()
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary workify-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/workify">
          Workify
        </Link>
        
        <div className="navbar-nav ms-auto d-flex align-items-center">
          <NotificationBell />
          <div className="nav-item dropdown ms-3">
            <a
              className="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div className="user-avatar me-2">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <span>{user?.fullName || user?.username}</span>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link className="dropdown-item" to="/workify/profile">
                  <i className="bi bi-person me-2"></i>
                  Thông tin cá nhân
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default WorkifyNavbar
