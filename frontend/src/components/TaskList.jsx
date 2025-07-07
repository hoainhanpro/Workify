import React from 'react'

const TaskList = ({ tasks, loading, error, showActions = false, onTaskUpdate = null }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TODO':
        return 'bg-secondary'
      case 'IN_PROGRESS':
        return 'bg-warning'
      case 'COMPLETED':
        return 'bg-success'
      default:
        return 'bg-secondary'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'TODO':
        return 'Chưa bắt đầu'
      case 'IN_PROGRESS':
        return 'Đang thực hiện'
      case 'COMPLETED':
        return 'Hoàn thành'
      default:
        return status
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-info'
      case 'MEDIUM':
        return 'bg-warning'
      case 'HIGH':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'Thấp'
      case 'MEDIUM':
        return 'Trung bình'
      case 'HIGH':
        return 'Cao'
      default:
        return priority
    }
  }

  const handleStatusChange = async (task, newStatus) => {
    if (onTaskUpdate) {
      try {
        await onTaskUpdate(task.id, { ...task, status: newStatus })
      } catch (error) {
        console.error('Error updating task status:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2">Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-inbox display-4 text-muted"></i>
        <p className="text-muted mt-2">Chưa có nhiệm vụ nào</p>
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Tạo nhiệm vụ đầu tiên
        </button>
      </div>
    )
  }

  return (
    <div className="list-group list-group-flush">
      {tasks.map((task) => (
        <div key={task.id} className="list-group-item border-0 py-3 px-3">
          <div className="d-flex align-items-start">
            {/* Checkbox */}
            <div className="form-check me-3" style={{ minWidth: '20px' }}>
              <input 
                className="form-check-input mt-1" 
                type="checkbox" 
                checked={task.status === 'COMPLETED'}
                onChange={(e) => {
                  if (showActions && onTaskUpdate) {
                    const newStatus = e.target.checked ? 'COMPLETED' : 'TODO'
                    handleStatusChange(task, newStatus)
                  }
                }}
                disabled={!showActions}
              />
            </div>
            
            {/* Main Content */}
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
                {/* Left Content */}
                <div className="flex-grow-1 min-w-0">
                  <div className="mb-2">
                    <h6 className={`mb-1 fw-semibold ${task.status === 'COMPLETED' ? 'text-decoration-line-through text-muted' : ''}`}>
                      {task.title}
                    </h6>
                    {task.description && (
                      <p className="mb-2 text-muted small lh-sm">{task.description}</p>
                    )}
                  </div>
                  
                  {/* Meta Info */}
                  <div className="d-flex flex-column flex-sm-row gap-2 align-items-start">
                    <small className="text-muted d-flex align-items-center">
                      <i className="bi bi-clock me-1"></i>
                      {task.status === 'COMPLETED' && task.completedAt 
                        ? `Hoàn thành lúc ${formatDate(task.completedAt)}`
                        : `Cập nhật lúc ${formatDate(task.updatedAt)}`
                      }
                    </small>
                    
                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="d-flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="badge bg-light text-dark small border">
                            #{tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="badge bg-light text-dark small border">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Content - Status & Actions */}
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  {/* Status & Priority Badges */}
                  <div className="d-flex gap-1 align-items-center">
                    <span className={`badge ${getStatusBadge(task.status)} px-2 py-1`}>
                      <span className="d-none d-md-inline">{getStatusText(task.status)}</span>
                      <span className="d-md-none">
                        {task.status === 'TODO' ? 'Chưa BĐ' : 
                         task.status === 'IN_PROGRESS' ? 'Đang TH' : 'Hoàn thành'}
                      </span>
                    </span>
                    <span className={`badge ${getPriorityBadge(task.priority)} px-2 py-1`}>
                      <span className="d-none d-md-inline">{getPriorityText(task.priority)}</span>
                      <span className="d-md-none">
                        {task.priority === 'LOW' ? 'T' : 
                         task.priority === 'MEDIUM' ? 'TB' : 'C'}
                      </span>
                    </span>
                  </div>
                  
                  {/* Actions Dropdown */}
                  {showActions && (
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-outline-secondary border-0 p-2" 
                        type="button" 
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ minWidth: '32px', minHeight: '32px' }}
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                        <li>
                          <button className="dropdown-item py-2" type="button">
                            <i className="bi bi-pencil me-2"></i>
                            Chỉnh sửa
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item py-2" type="button">
                            <i className="bi bi-eye me-2"></i>
                            Xem chi tiết
                          </button>
                        </li>
                        <li><hr className="dropdown-divider my-1" /></li>
                        <li>
                          <button className="dropdown-item text-danger py-2" type="button">
                            <i className="bi bi-trash me-2"></i>
                            Xóa
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskList
