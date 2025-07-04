import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const Home = () => {
  const { isAuthenticated, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <h1 className="display-4 mb-4">Chào mừng bạn trở lại!</h1>
          <p className="lead mb-4">Bạn đã đăng nhập thành công. Hãy tiếp tục làm việc hiệu quả với Workify.</p>
          <Link to="/workify" className="btn btn-primary btn-lg">
            Vào ứng dụng Workify
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">Workify</h1>
        <p className="lead text-muted mb-4">Quản lý công việc thông minh, nâng cao hiệu suất làm việc</p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/auth/login" className="btn btn-primary btn-lg">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Đăng nhập
          </Link>
          <Link to="/auth/register" className="btn btn-outline-primary btn-lg">
            <i className="bi bi-person-plus me-2"></i>
            Đăng ký tài khoản
          </Link>
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 rounded-3 p-3 d-inline-block mb-3">
                <i className="bi bi-check2-square text-primary fs-1"></i>
              </div>
              <h5 className="card-title">Quản lý nhiệm vụ</h5>
              <p className="card-text text-muted">
                Tạo, theo dõi và hoàn thành các nhiệm vụ một cách có tổ chức và hiệu quả.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 rounded-3 p-3 d-inline-block mb-3">
                <i className="bi bi-journal-text text-success fs-1"></i>
              </div>
              <h5 className="card-title">Ghi chú thông minh</h5>
              <p className="card-text text-muted">
                Tạo và chia sẻ ghi chú với đồng nghiệp, hỗ trợ AI để viết nội dung.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="bg-info bg-opacity-10 rounded-3 p-3 d-inline-block mb-3">
                <i className="bi bi-people text-info fs-1"></i>
              </div>
              <h5 className="card-title">Cộng tác nhóm</h5>
              <p className="card-text text-muted">
                Làm việc nhóm hiệu quả với các công cụ chia sẻ và cộng tác real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 