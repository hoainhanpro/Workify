import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import workspaceService from '../services/workspaceService';

const AssignTaskModal = ({ show, onHide, taskId, taskTitle, workspaceId, onAssigned }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [notifyAssignee, setNotifyAssignee] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real data from API
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (show && workspaceId) {
      loadWorkspaceMembers();
    }
  }, [show, workspaceId]);

  const loadWorkspaceMembers = async () => {
    try {
      setLoadingMembers(true);
      const members = await workspaceService.getWorkspaceMembers(workspaceId);
      setWorkspaceMembers(members);
    } catch (error) {
      console.error('Error loading workspace members:', error);
      setError('Không thể tải danh sách thành viên');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser) {
      alert('Vui lòng chọn người được giao task');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const assignRequest = {
        assigneeUserId: selectedUser,
        message: message.trim(),
        notifyAssignee: notifyAssignee
      };

      await taskService.assignTaskDetailed(taskId, assignRequest);
      
      // Reset form
      setSelectedUser('');
      setMessage('');
      setNotifyAssignee(true);
      
      // Notify parent component
      if (onAssigned) {
        onAssigned();
      }
      
      onHide();
    } catch (error) {
      console.error('Error assigning task:', error);
      setError('Lỗi khi giao task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      'OWNER': 'badge bg-danger',
      'ADMIN': 'badge bg-warning',
      'EDITOR': 'badge bg-success',
      'VIEWER': 'badge bg-secondary'
    };
    return badges[role] || 'badge bg-secondary';
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-plus"></i> Giao Task
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          
          <div className="modal-body">
            {loading && (
              <div className="text-center mb-3">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="ms-2">Đang tải dữ liệu...</span>
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError('')}
                ></button>
              </div>
            )}
            
            {/* User Selection */}
            <div className="mb-3">
              <label className="form-label">Giao cho thành viên *</label>
              <select 
                className="form-select" 
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">-- Chọn thành viên --</option>
                {workspaceMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              
              {/* Show selected user info */}
              {selectedUser && (
                <div className="mt-2 p-2 bg-light rounded">
                  {(() => {
                    const member = workspaceMembers.find(m => m.id === selectedUser);
                    return member ? (
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{member.name}</strong>
                          <br />
                          <small className="text-muted">{member.email}</small>
                        </div>
                        <span className={getRoleBadge(member.role)}>
                          {member.role}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Message */}
            <div className="mb-3">
              <label className="form-label">Tin nhắn kèm theo (tùy chọn)</label>
              <textarea 
                className="form-control" 
                rows="3"
                placeholder="Thêm ghi chú hoặc hướng dẫn cho người được giao..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <div className="form-text">
                Tin nhắn này sẽ được gửi kèm thông báo assign task
              </div>
            </div>

            {/* Notification Option */}
            <div className="mb-3">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="notifyAssignee"
                  checked={notifyAssignee}
                  onChange={(e) => setNotifyAssignee(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="notifyAssignee">
                  Gửi thông báo cho người được giao
                </label>
              </div>
              <div className="form-text">
                Người được giao sẽ nhận được thông báo về task mới
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Hủy
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleAssign}
              disabled={loading || !selectedUser}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang giao...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Giao Task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;
