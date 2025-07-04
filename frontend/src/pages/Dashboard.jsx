import React from 'react'
import { useAuthContext } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuthContext()

  return (
    <div className="dashboard">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">Chào mừng trở lại, {user?.fullName || user?.username}!</h1>
              <p className="text-muted mb-0">Hãy bắt đầu ngày làm việc hiệu quả</p>
            </div>
            <div className="text-end">
              <small className="text-muted">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Quick Stats */}
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-check2-square text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Nhiệm vụ hoàn thành</h6>
                  <h4 className="mb-0">12</h4>
                  <small className="text-success">+3 hôm nay</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-clock text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Đang thực hiện</h6>
                  <h4 className="mb-0">5</h4>
                  <small className="text-muted">Ưu tiên cao: 2</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-journal-text text-info fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Ghi chú</h6>
                  <h4 className="mb-0">8</h4>
                  <small className="text-muted">Cập nhật gần đây</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-trophy text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Hiệu suất</h6>
                  <h4 className="mb-0">85%</h4>
                  <small className="text-success">+5% tuần này</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        {/* Recent Tasks */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="mb-0">Nhiệm vụ gần đây</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex align-items-center">
                    <input className="form-check-input me-3" type="checkbox" />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">Hoàn thiện báo cáo tháng</h6>
                      <small className="text-muted">Hạn: Hôm nay, 17:00</small>
                    </div>
                    <span className="badge bg-danger">Cao</span>
                  </div>
                </div>
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex align-items-center">
                    <input className="form-check-input me-3" type="checkbox" />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">Review code feature mới</h6>
                      <small className="text-muted">Hạn: Ngày mai, 10:00</small>
                    </div>
                    <span className="badge bg-warning">Trung bình</span>
                  </div>
                </div>
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex align-items-center">
                    <input className="form-check-input me-3" type="checkbox" defaultChecked />
                    <div className="flex-grow-1">
                      <h6 className="mb-1 text-decoration-line-through text-muted">Cập nhật documentation</h6>
                      <small className="text-muted">Hoàn thành lúc 14:30</small>
                    </div>
                    <span className="badge bg-success">Hoàn thành</span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-3">
                <button className="btn btn-outline-primary">Xem tất cả nhiệm vụ</button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="mb-0">Hành động nhanh</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Tạo nhiệm vụ mới
                </button>
                <button className="btn btn-outline-primary">
                  <i className="bi bi-journal-plus me-2"></i>
                  Thêm ghi chú
                </button>
                <button className="btn btn-outline-primary">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Lên lịch họp
                </button>
                <button className="btn btn-outline-primary">
                  <i className="bi bi-share me-2"></i>
                  Chia sẻ dự án
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
