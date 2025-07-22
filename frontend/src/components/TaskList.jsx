import React, { useState } from 'react'
import SubTaskList from './SubTaskList'
import taskService from '../services/taskService'
import './TaskList.css'

const TaskList = ({ tasks, loading, error, showActions = false, onTaskUpdate = null, onTaskEdit = null, onTaskDelete = null, onRefresh = null, onCreateTask = null, availableTags = [] }) => {
  // State to track which tasks have expanded subtasks
  const [expandedTasks, setExpandedTasks] = useState(new Set())

  // Toggle expand/collapse for a specific task
  const toggleSubTasks = (taskId) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }
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

  const handleEditTask = (task) => {
    if (onTaskEdit) {
      onTaskEdit(task)
    }
  }

  const handleDeleteTask = async (task) => {
    if (onTaskDelete) {
      onTaskDelete(task)
    }
  }

  const handleSubTaskUpdate = async (taskId, subTaskId, subTaskData) => {
    try {
      await taskService.updateSubTask(taskId, subTaskId, subTaskData);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
  };

  const handleSubTaskDelete = async (taskId, subTaskId) => {
    try {
      await taskService.deleteSubTask(taskId, subTaskId);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
      throw error;
    }
  };

  const handleCalendarSync = async (taskId, enabled) => {
    try {
      await taskService.updateCalendarSync(taskId, enabled);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating calendar sync:', error);
      alert('Lỗi cập nhật đồng bộ lịch: ' + error.message);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - now.getTime();
    const hoursUntilDue = timeDiff / (1000 * 3600);
    return hoursUntilDue > 0 && hoursUntilDue <= 24;
  };

  // Helper function to get tag name from tag ID
  const getTagName = (tagId) => {
    const tag = availableTags.find(t => t.id === tagId);
    return tag ? tag.name : tagId; // Fallback to ID if tag not found
  };

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
    return (      <div className="text-center py-4">
        <i className="bi bi-inbox display-4 text-muted"></i>
        <p className="text-muted mt-2">Chưa có nhiệm vụ nào</p>
        <button 
          className="btn btn-primary"
          onClick={() => onCreateTask && onCreateTask()}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Tạo nhiệm vụ đầu tiên
        </button>
      </div>
    )
  }
  return (
    <div>      {/* Global expand/collapse controls */}
      {tasks.some(task => task.subTasks && task.subTasks.length > 0) && (
        <div className="d-flex justify-content-between align-items-center px-3 py-2 task-expand-controls">
          <small className="text-primary fw-semibold">
            <i className="bi bi-list-task me-1"></i>
            Điều khiển công việc con
          </small>
          <div className="d-flex gap-1">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => {
                const tasksWithSubTasks = tasks
                  .filter(task => task.subTasks && task.subTasks.length > 0)
                  .map(task => task.id)
                setExpandedTasks(new Set(tasksWithSubTasks))
              }}
              style={{ fontSize: '0.75rem' }}
            >
              <i className="bi bi-chevron-double-down me-1"></i>
              <span className="d-none d-md-inline">Mở rộng tất cả</span>
              <span className="d-md-none">Mở tất cả</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setExpandedTasks(new Set())}
              style={{ fontSize: '0.75rem' }}
            >
              <i className="bi bi-chevron-double-up me-1"></i>
              <span className="d-none d-md-inline">Thu gọn tất cả</span>
              <span className="d-md-none">Thu tất cả</span>
            </button>
          </div>
        </div>
      )}
      
      <div className="list-group list-group-flush">{tasks.map((task) => (
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
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">                {/* Left Content */}
                <div className="flex-grow-1 min-w-0">                  <div className="mb-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className={`mb-0 fw-semibold ${task.status === 'COMPLETED' ? 'text-decoration-line-through text-muted' : ''}`}>
                        {task.title}
                      </h6>
                        {/* Subtask info and controls */}
                      {task.subTasks && task.subTasks.length > 0 && (
                        <div className="d-flex align-items-center gap-1">
                          {/* Subtask count badge */}
                          <span className="badge bg-light text-dark border" style={{ fontSize: '0.65rem' }}>
                            <i className="bi bi-list-task me-1"></i>
                            {task.subTasks.filter(st => st.status === 'COMPLETED').length}/{task.subTasks.length}
                          </span>
                            {/* Individual task toggle button */}
                          <button
                            type="button"
                            className={`btn btn-sm ${expandedTasks.has(task.id) ? 'task-expanded-indicator' : 'btn-outline-primary'} border d-flex align-items-center subtask-toggle-btn`}
                            onClick={() => toggleSubTasks(task.id)}
                            title={expandedTasks.has(task.id) ? 'Thu gọn công việc con' : 'Mở rộng công việc con'}
                            style={{ minWidth: 'auto', minHeight: '24px', fontSize: '0.7rem', padding: '2px 6px' }}
                          >
                            <i className={`bi ${expandedTasks.has(task.id) ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}></i>
                            <span className="d-none d-sm-inline">
                              {expandedTasks.has(task.id) ? 'Thu gọn' : 'Mở rộng'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                      {/* Subtask progress bar (only show when has subtasks) */}
                    {task.subTasks && task.subTasks.length > 0 && (
                      <div className="mb-2">
                        <div className="progress subtask-progress" style={{ height: '6px' }}>
                          <div 
                            className={`progress-bar subtask-progress-bar ${
                              task.subTasks.filter(st => st.status === 'COMPLETED').length === task.subTasks.length 
                                ? 'bg-success' 
                                : task.subTasks.filter(st => st.status === 'COMPLETED').length > 0 
                                  ? 'bg-warning' 
                                  : 'bg-secondary'
                            }`}
                            style={{ 
                              width: `${(task.subTasks.filter(st => st.status === 'COMPLETED').length / task.subTasks.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <small className="text-muted d-flex justify-content-between align-items-center" style={{ fontSize: '0.7rem' }}>
                          <span>
                            <i className="bi bi-graph-up me-1"></i>
                            Tiến độ: {Math.round((task.subTasks.filter(st => st.status === 'COMPLETED').length / task.subTasks.length) * 100)}%
                          </span>
                          {expandedTasks.has(task.id) && (
                            <span className="text-primary">
                              <i className="bi bi-eye me-1"></i>
                              Đang hiển thị
                            </span>
                          )}
                        </small>
                      </div>
                    )}
                    
                    {task.description && (
                      <p className="mb-2 text-muted small lh-sm">{task.description}</p>
                    )}
                  </div>
                    {/* Meta Info */}
                  <div className="d-flex flex-column flex-sm-row gap-2 align-items-start">                    {/* Comment out timestamp display as requested */}
                    {/* <small className="text-muted d-flex align-items-center">
                      <i className="bi bi-clock me-1"></i>
                      {task.status === 'COMPLETED' && task.completedAt 
                        ? `Hoàn thành lúc ${formatDate(task.completedAt)}`
                        : `Cập nhật lúc ${formatDate(task.updatedAt)}`
                      }
                    </small> */}
                    
                    {/* Due Date */}
                    {task.dueDate && (
                      <small className={`d-flex align-items-center ${
                        new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' 
                          ? 'text-danger' : 'text-muted'
                      }`}>
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' 
                          ? 'Quá hạn: ' 
                          : 'Hạn: '
                        }
                        {formatDate(task.dueDate)}
                      </small>
                    )}
                    
                      {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="d-flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index} 
                            className="badge text-dark small" 
                            style={{ 
                              backgroundColor: '#e3f2fd', 
                              border: '1px solid #bbdefb',
                              fontSize: '0.7rem'
                            }}
                          >
                            <i className="bi bi-tag me-1"></i>
                            {getTagName(tag)}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span 
                            className="badge bg-secondary text-white small" 
                            style={{ fontSize: '0.7rem' }}
                          >
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
                      </button>                      <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                        <li>
                          <button 
                            className="dropdown-item py-2" 
                            type="button"
                            onClick={() => handleEditTask(task)}
                          >
                            <i className="bi bi-pencil me-2"></i>
                            Chỉnh sửa
                          </button>
                        </li>
                        
                        {/* Subtask toggle option in dropdown */}
                        {task.subTasks && task.subTasks.length > 0 && (
                          <li>
                            <button 
                              className="dropdown-item py-2" 
                              type="button"
                              onClick={() => toggleSubTasks(task.id)}
                            >
                              <i className={`bi ${expandedTasks.has(task.id) ? 'bi-chevron-up' : 'bi-chevron-down'} me-2`}></i>
                              {expandedTasks.has(task.id) ? 'Thu gọn công việc con' : 'Mở rộng công việc con'}
                            </button>
                          </li>
                        )}
                        
                        <li>
                          <button className="dropdown-item py-2" type="button">
                            <i className="bi bi-eye me-2"></i>
                            Xem chi tiết
                          </button>
                        </li>
                        <li><hr className="dropdown-divider my-1" /></li>
                        <li>
                          <button 
                            className="dropdown-item text-danger py-2" 
                            type="button"
                            onClick={() => handleDeleteTask(task)}
                          >
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

          {/* Due Date and Calendar Sync */}
          {(task.dueDate || task.syncWithCalendar) && (
            <div className="d-flex flex-column flex-sm-row gap-2 align-items-start mt-2">
              {task.dueDate && (
                <small className={`d-flex align-items-center ${
                  isOverdue(task.dueDate) ? 'text-danger' : 
                  isDueSoon(task.dueDate) ? 'text-warning' : 'text-muted'
                }`}>
                  <i className={`bi ${
                    isOverdue(task.dueDate) ? 'bi-exclamation-triangle-fill' : 
                    isDueSoon(task.dueDate) ? 'bi-clock-fill' : 'bi-calendar3'
                  } me-1`}></i>
                  {isOverdue(task.dueDate) ? 'Quá hạn: ' : 
                   isDueSoon(task.dueDate) ? 'Sắp đến hạn: ' : 'Hạn: '}
                  {formatDate(task.dueDate)}
                </small>
              )}
              
              {task.syncWithCalendar && (
                <div className="d-flex align-items-center">
                  <small className="text-success me-2">
                    <i className="bi bi-calendar-check me-1"></i>
                    Đồng bộ lịch
                  </small>
                  {task.googleCalendarEventId && (
                    <small className="text-muted">
                      <i className="bi bi-link-45deg"></i>
                    </small>
                  )}
                  {showActions && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 ms-2"
                      onClick={() => handleCalendarSync(task.id, !task.syncWithCalendar)}
                      title={task.syncWithCalendar ? 'Tắt đồng bộ lịch' : 'Bật đồng bộ lịch'}
                    >
                      <i className={`bi ${task.syncWithCalendar ? 'bi-calendar-x' : 'bi-calendar-plus'} text-muted`}></i>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}          {/* SubTasks */}
          {task.subTasks && task.subTasks.length > 0 && expandedTasks.has(task.id) && (
            <div className="mt-3 ps-4 border-start border-2 border-light">
              <SubTaskList
                subTasks={task.subTasks}
                taskId={task.id}
                onSubTaskUpdate={handleSubTaskUpdate}
                onSubTaskDelete={handleSubTaskDelete}
                onTaskStatusUpdate={(newStatus) => handleTaskStatusUpdate(task.id, newStatus)}
                readOnly={!showActions}
              />            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  )
}

export default TaskList
