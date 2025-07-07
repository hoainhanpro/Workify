import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useTasks } from '../hooks/useTasks'
import TaskList from '../components/TaskList'
import DebugInfo from '../components/DebugInfo'

const Dashboard = () => {
  const { user } = useAuthContext()
  const { tasks, statistics, loading, error } = useTasks()

  // Get recent tasks (latest 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)

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
                  <div className="bg-success bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-check2-square text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Nhiệm vụ hoàn thành</h6>
                  <h4 className="mb-0">{loading ? '...' : statistics.completed}</h4>
                  <small className="text-success">Đã hoàn thành</small>
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
                  <h4 className="mb-0">{loading ? '...' : statistics.inProgress}</h4>
                  <small className="text-muted">Đang làm việc</small>
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
                  <div className="bg-secondary bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-list-task text-secondary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Chưa bắt đầu</h6>
                  <h4 className="mb-0">{loading ? '...' : statistics.todo}</h4>
                  <small className="text-muted">Cần thực hiện</small>
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
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-trophy text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Tổng nhiệm vụ</h6>
                  <h4 className="mb-0">{loading ? '...' : statistics.total}</h4>
                  <small className="text-success">
                    {statistics.total > 0 ? `${Math.round((statistics.completed / statistics.total) * 100)}% hoàn thành` : 'Chưa có task'}
                  </small>
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
              <TaskList 
                tasks={recentTasks} 
                loading={loading} 
                error={error}
                showActions={false}
              />
              <div className="text-center mt-3">
                <Link to="/workify/tasks" className="btn btn-outline-primary">
                  <i className="bi bi-list-ul me-2"></i>
                  Xem tất cả nhiệm vụ
                </Link>
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

      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="row mt-4">
          <div className="col-12">
            <DebugInfo />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
