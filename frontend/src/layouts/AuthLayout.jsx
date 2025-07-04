import React from 'react'
import { Outlet } from 'react-router-dom'
import '../styles/AuthLayout.css'

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Workify</h1>
          <p className="auth-subtitle">Quản lý công việc thông minh</p>
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
