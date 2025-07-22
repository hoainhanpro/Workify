import React, { useState } from 'react';
import './SubTaskList.css';

const SubTaskList = ({ subTasks = [], taskId, onSubTaskUpdate, onSubTaskDelete, onTaskStatusUpdate, readOnly = false }) => {
  const [expandedSubTasks, setExpandedSubTasks] = useState(new Set());

  const toggleSubTaskExpansion = (subTaskId) => {
    const newExpanded = new Set(expandedSubTasks);
    if (newExpanded.has(subTaskId)) {
      newExpanded.delete(subTaskId);
    } else {
      newExpanded.add(subTaskId);
    }
    setExpandedSubTasks(newExpanded);
  };

  const updateMainTaskStatus = (updatedSubTasks) => {
    if (!onTaskStatusUpdate) return;

    const completedSubTasks = updatedSubTasks.filter(st => st.status === 'COMPLETED');
    const inProgressSubTasks = updatedSubTasks.filter(st => st.status === 'IN_PROGRESS');
    
    let newMainTaskStatus;
    
    // Nếu tất cả subtask hoàn thành
    if (completedSubTasks.length === updatedSubTasks.length && updatedSubTasks.length > 0) {
      newMainTaskStatus = 'COMPLETED';
    }
    // Nếu có ít nhất 1 subtask không phải TODO
    else if (completedSubTasks.length > 0 || inProgressSubTasks.length > 0) {
      newMainTaskStatus = 'IN_PROGRESS';
    }
    // Nếu tất cả subtask đều TODO
    else {
      newMainTaskStatus = 'TODO';
    }
    
    onTaskStatusUpdate(newMainTaskStatus);
  };

  const handleStatusChange = async (subTask, newStatus) => {
    if (readOnly || !onSubTaskUpdate) return;
    
    try {
      const updatedSubTask = { ...subTask, status: newStatus };
      await onSubTaskUpdate(taskId, subTask.id, updatedSubTask);
      
      // Cập nhật trạng thái task chính
      const updatedSubTasks = subTasks.map(st => 
        st.id === subTask.id ? updatedSubTask : st
      );
      updateMainTaskStatus(updatedSubTasks);
    } catch (error) {
      console.error('Error updating subtask status:', error);
    }
  };

  const handleDeleteSubTask = async (subTaskId) => {
    if (readOnly || !onSubTaskDelete) return;
    
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc con này?')) {
      try {
        await onSubTaskDelete(taskId, subTaskId);
      } catch (error) {
        console.error('Error deleting subtask:', error);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TODO':
        return 'badge bg-secondary';
      case 'IN_PROGRESS':
        return 'badge bg-warning text-dark';
      case 'COMPLETED':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'TODO':
        return 'Chưa bắt đầu';
      case 'IN_PROGRESS':
        return 'Đang thực hiện';
      case 'COMPLETED':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'badge bg-danger';
      case 'MEDIUM':
        return 'badge bg-warning text-dark';
      case 'LOW':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'Cao';
      case 'MEDIUM':
        return 'Trung bình';
      case 'LOW':
        return 'Thấp';
      default:
        return priority;
    }
  };

  if (!subTasks || subTasks.length === 0) {
    return (
      <div className="subtask-list-empty">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Không có công việc con
        </small>
      </div>
    );
  }

  const completedCount = subTasks.filter(st => st.status === 'COMPLETED').length;
  const completionPercentage = Math.round((completedCount / subTasks.length) * 100);

  return (
    <div className="subtask-list">
      <div className="subtask-summary mb-2">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="bi bi-list-task me-1"></i>
            Công việc con ({completedCount}/{subTasks.length})
          </small>
          <small className="text-muted">{completionPercentage}%</small>
        </div>
        <div className="progress" style={{ height: '4px' }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="subtask-items">
        {subTasks.map((subTask, index) => {
          const isExpanded = expandedSubTasks.has(subTask.id);
          const isOverdue = subTask.dueDate && new Date(subTask.dueDate) < new Date() && subTask.status !== 'COMPLETED';
          
          return (
            <div key={subTask.id} className={`subtask-item ${subTask.status === 'COMPLETED' ? 'completed' : ''}`}>              <div className="subtask-header">
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={subTask.status === 'COMPLETED'}
                    onChange={(e) => handleStatusChange(subTask, e.target.checked ? 'COMPLETED' : 'TODO')}
                    disabled={readOnly}
                  />
                  
                  <span className={`subtask-title flex-grow-1 ${subTask.status === 'COMPLETED' ? 'text-decoration-line-through text-muted' : ''}`}>
                    {subTask.title}
                  </span>
                  
                  <div className="subtask-badges">                    {!readOnly && (
                      <select
                        className="form-select form-select-sm subtask-status-select me-2"
                        value={subTask.status}
                        onChange={(e) => handleStatusChange(subTask, e.target.value)}
                      >
                        <option value="TODO">Chưa bắt đầu</option>
                        <option value="IN_PROGRESS">Đang thực hiện</option>
                        <option value="COMPLETED">Hoàn thành</option>
                      </select>
                    )}
                    
                    <span className={getPriorityBadgeClass(subTask.priority)}>
                      {getPriorityText(subTask.priority)}
                    </span>
                    {isOverdue && (
                      <span className="badge bg-danger ms-1">
                        <i className="bi bi-clock"></i> Quá hạn
                      </span>
                    )}
                  </div>

                  {!readOnly && (
                    <div className="subtask-actions ms-2">
                      {subTask.description && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0 me-1"
                          onClick={() => toggleSubTaskExpansion(subTask.id)}
                          title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                        >
                          <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                        </button>
                      )}
                      
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={() => handleDeleteSubTask(subTask.id)}
                        title="Xóa công việc con"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && subTask.description && (
                <div className="subtask-description mt-2">
                  <small className="text-muted">{subTask.description}</small>
                </div>
              )}

              <div className="subtask-meta mt-1">
                <small className="text-muted">
                  <span className={getStatusBadgeClass(subTask.status)}>
                    {getStatusText(subTask.status)}
                  </span>
                  
                  {subTask.dueDate && (
                    <span className="ms-2">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(subTask.dueDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                  
                  {subTask.completedAt && (
                    <span className="ms-2 text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      Hoàn thành: {new Date(subTask.completedAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubTaskList;
