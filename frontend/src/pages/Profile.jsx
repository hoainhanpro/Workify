import React, { useState } from 'react'
import { useAuthContext } from '../context/AuthContext'

const Profile = () => {
  const { user } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    // TODO: Implement update profile API
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  return (
    <div className="profile">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4">Thông tin cá nhân</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Thông tin tài khoản</h5>
                {!isEditing ? (
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="btn-group">
                    <button 
                      className="btn btn-success"
                      onClick={handleSave}
                    >
                      <i className="bi bi-check-lg me-2"></i>
                      Lưu
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Họ và tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="form-control-plaintext">{user?.fullName}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Username</label>
                  <div className="form-control-plaintext">{user?.username}</div>
                  <small className="text-muted">Username không thể thay đổi</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="form-control-plaintext">{user?.email}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Vai trò</label>
                  <div className="form-control-plaintext">
                    <span className={`badge ${user?.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                      {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Trạng thái tài khoản</label>
                  <div className="form-control-plaintext">
                    <span className={`badge ${user?.enabled ? 'bg-success' : 'bg-danger'}`}>
                      {user?.enabled ? 'Đang hoạt động' : 'Bị khóa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="mb-0">Ảnh đại diện</h5>
            </div>
            <div className="card-body text-center">
              <div className="profile-avatar mx-auto mb-3">
                <div className="avatar-placeholder">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
              </div>
              <button className="btn btn-outline-primary">
                <i className="bi bi-camera me-2"></i>
                Đổi ảnh đại diện
              </button>
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="mb-0">Bảo mật</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-warning">
                  <i className="bi bi-key me-2"></i>
                  Đổi mật khẩu
                </button>
                <button className="btn btn-outline-info">
                  <i className="bi bi-shield-check me-2"></i>
                  Xem phiên đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
