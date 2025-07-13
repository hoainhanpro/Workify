import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../context/AuthContext'
import oauthAccountService from '../services/oauthAccountService'

const Profile = () => {
  const { user } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [linkedAccounts, setLinkedAccounts] = useState({})
  const [loadingAccounts, setLoadingAccounts] = useState(true)
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

  // Load linked accounts on component mount
  useEffect(() => {
    const loadLinkedAccounts = async () => {
      try {
        // Simulate checking linked accounts based on user data
        const accounts = {
          google: user?.authProvider === 'GOOGLE' || user?.googleId ? {
            email: user?.email,
            linkedAt: user?.createdAt,
            provider: 'GOOGLE'
          } : null
        }
        
        setLinkedAccounts(accounts)
      } catch (error) {
        console.error('Error loading linked accounts:', error)
      } finally {
        setLoadingAccounts(false)
      }
    }

    loadLinkedAccounts()
  }, [user])

  const handleLinkGoogle = () => {
    try {
      oauthAccountService.linkGoogleAccount()
    } catch (error) {
      console.error('Error linking Google account:', error)
    }
  }

  const handleUnlinkGoogle = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy liên kết tài khoản Google?')) {
      return
    }

    try {
      await oauthAccountService.unlinkGoogleAccount()
      setLinkedAccounts(prev => ({
        ...prev,
        google: null
      }))
      alert('Đã hủy liên kết tài khoản Google thành công!')
    } catch (error) {
      console.error('Error unlinking Google account:', error)
      alert('Lỗi khi hủy liên kết tài khoản Google')
    }
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
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="avatar-image"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <button className="btn btn-outline-primary">
                <i className="bi bi-camera me-2"></i>
                Đổi ảnh đại diện
              </button>
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="mb-0">Liên kết tài khoản</h5>
            </div>
            <div className="card-body">
              {loadingAccounts ? (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Đang tải...
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {/* Google Account */}
                  <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                    <div className="d-flex align-items-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" className="me-3">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <div>
                        <div className="fw-medium">Google</div>
                        {linkedAccounts.google ? (
                          <small className="text-muted">{linkedAccounts.google.email}</small>
                        ) : (
                          <small className="text-muted">Chưa liên kết</small>
                        )}
                      </div>
                    </div>
                    <div>
                      {linkedAccounts.google ? (
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '1.2rem' }}></i>
                          </div>
                          <button 
                            className="btn btn-sm btn-light border p-1"
                            onClick={handleUnlinkGoogle}
                            title="Hủy liên kết tài khoản Google"
                            style={{ 
                              width: '28px', 
                              height: '28px',
                              borderRadius: '50%',
                              transition: 'all 0.2s ease',
                              borderColor: '#dc3545'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#dc3545'
                              e.target.style.borderColor = '#dc3545'
                              const icon = e.target.querySelector('i')
                              if (icon) icon.style.color = 'white'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent'
                              e.target.style.borderColor = '#dc3545'
                              const icon = e.target.querySelector('i')
                              if (icon) icon.style.color = 'black'
                            }}
                          >
                            <i className="bi bi-unlink text-dark" style={{ fontSize: '0.9rem' }}></i>
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={handleLinkGoogle}
                        >
                          <i className="bi bi-link-45deg me-1"></i>
                          Liên kết
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
