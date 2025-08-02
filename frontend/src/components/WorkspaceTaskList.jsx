import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import ShareToWorkspaceModal from './ShareToWorkspaceModal';
import AssignTaskModal from './AssignTaskModal';
import PermissionsModal from './PermissionsModal';

const WorkspaceTaskList = ({ workspaceId, showActions = true, limit = null }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
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

      const workspaceTasks = await taskService.getWorkspaceTasksDetailed(workspaceId);
      
      // Apply limit if specified
      const limitedTasks = limit ? workspaceTasks.slice(0, limit) : workspaceTasks;
      setTasks(limitedTasks);
    } catch (error) {
      console.error('Error loading workspace tasks:', error);
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

  const handleTaskUpdated = () => {
    loadWorkspaceTasks();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'TODO': { variant: 'bg-secondary', icon: 'bi-clock' },
      'IN_PROGRESS': { variant: 'bg-warning', icon: 'bi-play-circle' },
      'DONE': { variant: 'bg-success', icon: 'bi-check-circle' },
      'CANCELLED': { variant: 'bg-danger', icon: 'bi-x-circle' }
    };

    const config = statusConfig[status] || statusConfig['TODO'];
    
    return (
      <span className={`badge me-2 ${config.variant}`}>
        <i className={`${config.icon} me-1`}></i>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'LOW': { variant: 'bg-light text-dark', text: 'Thấp' },
      'MEDIUM': { variant: 'bg-info', text: 'Trung bình' },
      'HIGH': { variant: 'bg-warning', text: 'Cao' },
      'URGENT': { variant: 'bg-danger', text: 'Khẩn cấp' }
    };

    const config = priorityConfig[priority] || priorityConfig['MEDIUM'];
    
    return (
      <span className={`badge ${config.variant}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

      <div className="row">
        {tasks.map((task) => (
          <div key={task.id} className="col-md-6 col-lg-4 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="card-title mb-0" title={task.title}>
                    {task.title.length > 50 ? task.title.substring(0, 50) + '...' : task.title}
                  </h6>
                  {showActions && (
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-three-dots"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleShareTask(task)}
                          >
                            <i className="bi bi-share me-2"></i>
                            Chia sẻ lại
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleAssignTask(task)}
                          >
                            <i className="bi bi-person-plus me-2"></i>
                            Giao task
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item"
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

                {task.description && (
                  <p className="card-text text-muted small">
                    {task.description.length > 100 
                      ? task.description.substring(0, 100) + '...' 
                      : task.description
                    }
                  </p>
                )}

                <div className="mb-2">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>

                <div className="small text-muted">
                  <div className="mb-1">
                    <i className="bi bi-calendar me-1"></i>
                    Due: {formatDate(task.dueDate)}
                  </div>
                  
                  {task.assignedUser && (
                    <div className="mb-1">
                      <i className="bi bi-person me-1"></i>
                      Giao cho: {task.assignedUser.name || task.assignedUser.email}
                    </div>
                  )}

                  {task.workspacePermissions && (
                    <div className="mb-1">
                      <i className="bi bi-shield me-1"></i>
                      Quyền: 
                      {task.workspacePermissions.read && ' Read'}
                      {task.workspacePermissions.write && ' Write'}
                      {task.workspacePermissions.delete && ' Delete'}
                    </div>
                  )}

                  <div className="mb-1">
                    <i className="bi bi-person-circle me-1"></i>
                    Tạo bởi: {task.creator?.name || task.creator?.email}
                  </div>
                </div>
              </div>
            </div>
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
