import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import ShareToWorkspaceModal from './ShareToWorkspaceModal';
import AssignTaskModal from './AssignTaskModal';
import PermissionsModal from './PermissionsModal';
import EditTaskModal from './EditTaskModal';

const WorkspaceTaskList = ({ workspaceId, showActions = true, limit = null }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  
  // Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceTasks();
    }
  }, [workspaceId]);

  const loadWorkspaceTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading workspace tasks for workspaceId:', workspaceId);
      const workspaceTasks = await taskService.getWorkspaceTasksDetailed(workspaceId);
      console.log('✅ Received workspace tasks:', workspaceTasks);
      
      // Apply limit if specified
      const limitedTasks = limit ? workspaceTasks.slice(0, limit) : workspaceTasks;
      console.log('📋 Setting tasks to display:', limitedTasks);
      setTasks(limitedTasks);
    } catch (error) {
      console.error('❌ Error loading workspace tasks:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareTask = (task) => {
    setSelectedTask(task);
    setShowShareModal(true);
  };

  const handleAssignTask = (task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  const handleEditPermissions = (task) => {
    setSelectedTask(task);
    setShowPermissionsModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleTaskUpdated = () => {
    loadWorkspaceTasks();
  };

  // Toggle expand/collapse for subtasks
  const toggleSubTasks = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
  };

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
  };

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
  };

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
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Đang tải danh sách tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-inbox fs-1 text-muted"></i>
        <p className="text-muted mt-2">Không có task nào trong workspace này</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          <i className="bi bi-list-task me-2"></i>
          Tasks trong Workspace ({tasks.length})
        </h6>
        {limit && tasks.length >= limit && (
          <small className="text-muted">Hiển thị {limit} task đầu tiên</small>
        )}
      </div>

      <div className="list-group list-group-flush">
        {tasks.map((task, index) => (
          <div key={task.id} className={`list-group-item border-0 py-3 px-3 ${index % 2 !== 1 ? 'bg-body-secondary' : ''}`}>
            <div className="d-flex align-items-start">
              {/* Main Content */}
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
                  {/* Left Content */}
                  <div className="flex-grow-1 min-w-0">
                    <div className="mb-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className={`mb-0 fw-semibold ${task.status === 'COMPLETED' ? 'text-decoration-line-through text-muted' : ''}`}>
                          {task.title}
                          {task.canEdit && (
                            <i className="bi bi-pencil-square ms-2 text-primary" 
                               title="Bạn có thể chỉnh sửa task này"
                               style={{ fontSize: '0.8rem' }}></i>
                          )}
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
                              className={`btn btn-sm ${expandedTasks.has(task.id) ? 'btn-primary' : 'btn-outline-primary'} border d-flex align-items-center`}
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
                      
                      {/* Subtask progress bar */}
                      {task.subTasks && task.subTasks.length > 0 && (
                        <div className="mb-2">
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className={`progress-bar ${
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
                          </small>
                        </div>
                      )}
                      
                      {task.description && (
                        <p className="mb-2 text-muted small lh-sm">{task.description}</p>
                      )}
                    </div>
                    
                    {/* Meta Info */}
                    <div className="d-flex flex-column flex-sm-row gap-2 align-items-start">
                      {/* Due Date */}
                      {task.dueDate && (
                        <small className="text-muted d-flex align-items-center">
                          <i className="bi bi-calendar3 me-1"></i>
                          Hạn: {formatDate(task.dueDate)}
                        </small>
                      )}
                      
                      {/* Creator info */}
                      {task.creator && (
                        <small className="text-muted d-flex align-items-center">
                          <i className="bi bi-person-circle me-1"></i>
                          Tạo bởi: {task.creator.name || task.creator.email}
                        </small>
                      )}
                      
                      {/* Assigned user */}
                      {task.assignedUser && (
                        <small className="text-muted d-flex align-items-center">
                          <i className="bi bi-person me-1"></i>
                          Giao cho: {task.assignedUser.name || task.assignedUser.email}
                        </small>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Content - Status & Actions */}
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    {/* Status & Priority Badges */}
                    <div className="d-flex gap-1 align-items-center">
                      <span className={`badge ${getStatusBadge(task.status)} px-2 py-1`}>
                        {getStatusText(task.status)}
                      </span>
                      <span className={`badge ${getPriorityBadge(task.priority)} px-2 py-1`}>
                        {getPriorityText(task.priority)}
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
                          {task.canEdit && (
                            <li>
                              <button 
                                className="dropdown-item py-2" 
                                type="button"
                                onClick={() => handleEditTask(task)}
                              >
                                <i className="bi bi-pencil-square me-2"></i>
                                Chỉnh sửa
                              </button>
                            </li>
                          )}
                          {task.canEdit && <li><hr className="dropdown-divider" /></li>}
                          <li>
                            <button 
                              className="dropdown-item py-2" 
                              type="button"
                              onClick={() => handleShareTask(task)}
                            >
                              <i className="bi bi-share me-2"></i>
                              Chia sẻ lại
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item py-2" 
                              type="button"
                              onClick={() => handleAssignTask(task)}
                            >
                              <i className="bi bi-person-plus me-2"></i>
                              Giao task
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item py-2" 
                              type="button"
                              onClick={() => handleEditPermissions(task)}
                            >
                              <i className="bi bi-shield-lock me-2"></i>
                              Quyền truy cập
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SubTasks */}
            {task.subTasks && task.subTasks.length > 0 && expandedTasks.has(task.id) && (
              <div className="mt-3 ps-4 border-start border-2 border-light">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-list-ul me-1"></i>
                  Công việc con ({task.subTasks.length})
                </h6>
                {task.subTasks.map((subtask, subIndex) => (
                  <div key={subtask.id || subIndex} className="mb-2 p-2 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <span className={`${subtask.status === 'COMPLETED' ? 'text-decoration-line-through text-muted' : ''}`}>
                          {subtask.title}
                        </span>
                        {subtask.description && (
                          <small className="d-block text-muted mt-1">{subtask.description}</small>
                        )}
                      </div>
                      <span className={`badge ${getStatusBadge(subtask.status)} ms-2`}>
                        {getStatusText(subtask.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-3">
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={loadWorkspaceTasks}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Làm mới
        </button>
      </div>

      {/* Modals */}
      {selectedTask && (
        <>
          <EditTaskModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            task={selectedTask}
            onTaskUpdated={async (taskId, taskData) => {
              try {
                console.log('🔄 Updating task via EditTaskModal:', taskId, taskData);
                const result = await taskService.updateTask(taskId, taskData);
                console.log('✅ Task updated successfully:', result);
                handleTaskUpdated();
                return result;
              } catch (error) {
                console.error('❌ Error updating task:', error);
                throw error;
              }
            }}
            availableTags={[]} // Có thể tích hợp tags service sau
          />

          <ShareToWorkspaceModal
            show={showShareModal}
            onHide={() => setShowShareModal(false)}
            itemType="task"
            itemId={selectedTask.id}
            itemTitle={selectedTask.title}
            onShared={handleTaskUpdated}
          />

          <AssignTaskModal
            show={showAssignModal}
            onHide={() => setShowAssignModal(false)}
            taskId={selectedTask.id}
            taskTitle={selectedTask.title}
            workspaceId={workspaceId}
            onAssigned={handleTaskUpdated}
          />

          <PermissionsModal
            show={showPermissionsModal}
            onHide={() => setShowPermissionsModal(false)}
            itemType="task"
            itemId={selectedTask.id}
            itemTitle={selectedTask.title}
            workspaceId={workspaceId}
            onPermissionsUpdated={handleTaskUpdated}
          />
        </>
      )}
    </div>
  );
};

export default WorkspaceTaskList;
