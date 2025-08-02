import React, { useState, useEffect } from 'react';
import workspaceService from '../services/workspaceService';
import taskService from '../services/taskService';
import noteService from '../services/noteService';

const ShareToWorkspaceModal = ({ show, onHide, itemType, itemId, itemTitle, onShared }) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [viewUsers, setViewUsers] = useState([]);
  const [editUsers, setEditUsers] = useState([]);
  const [shareToAll, setShareToAll] = useState(false);
  const [defaultPermission, setDefaultPermission] = useState('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real data from API
  const [workspaces, setWorkspaces] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (show) {
      loadWorkspaces();
    }
  }, [show]);

  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceMembers(selectedWorkspace);
    } else {
      setAvailableUsers([]);
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    try {
      setLoadingData(true);
      const workspacesData = await workspaceService.getAllWorkspaces();
      setWorkspaces(workspacesData);
    } catch (error) {
      console.error('Error loading workspaces:', error);
      setError('Không thể tải danh sách workspace');
    } finally {
      setLoadingData(false);
    }
  };

  const loadWorkspaceMembers = async (workspaceId) => {
    try {
      const members = await workspaceService.getWorkspaceMembers(workspaceId);
      // Filter ra Owner và Admin vì họ đã có toàn quyền
      const filteredMembers = members.filter(member => 
        member.role !== 'OWNER' && member.role !== 'ADMIN'
      );
      setAvailableUsers(filteredMembers);
    } catch (error) {
      console.error('Error loading workspace members:', error);
      setError('Không thể tải danh sách thành viên');
    }
  };

  const handleShare = async () => {
    if (!selectedWorkspace) {
      alert('Vui lòng chọn workspace');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const shareRequest = {
        workspaceId: selectedWorkspace,
        viewUserIds: viewUsers,
        editUserIds: editUsers,
        shareToAllMembers: shareToAll,
        defaultPermission: defaultPermission
      };

      // Call appropriate API based on item type
      if (itemType === 'task') {
        await taskService.shareTaskToWorkspaceDetailed(itemId, shareRequest);
      } else if (itemType === 'note') {
        await noteService.shareNoteToWorkspaceDetailed(itemId, shareRequest);
      }
      
      // Reset form
      setSelectedWorkspace('');
      setViewUsers([]);
      setEditUsers([]);
      setShareToAll(false);
      setDefaultPermission('view');
      
      // Notify parent component
      if (onShared) {
        onShared();
      }
      
      onHide();
    } catch (error) {
      console.error('Error sharing:', error);
      setError('Lỗi khi chia sẻ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserPermission = (userId, permissionType) => {
    if (permissionType === 'view') {
      setViewUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    } else if (permissionType === 'edit') {
      setEditUsers(prev => {
        const newEditUsers = prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId];
        
        // Nếu user có edit permission, tự động add view permission
        if (newEditUsers.includes(userId) && !viewUsers.includes(userId)) {
          setViewUsers(prevView => [...prevView, userId]);
        }
        
        return newEditUsers;
      });
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-share"></i> Chia sẻ {itemType} với Workspace
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          
          <div className="modal-body">
            {/* Item Title */}
            {itemTitle && (
              <div className="mb-3">
                <strong>Chia sẻ {itemType}:</strong> {itemTitle}
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Loading State */}
            {loadingData ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                {/* Workspace Selection */}
                <div className="mb-3">
                  <label className="form-label">Chọn Workspace *</label>
                  <select 
                    className="form-select" 
                    value={selectedWorkspace}
                    onChange={(e) => setSelectedWorkspace(e.target.value)}
                  >
                    <option value="">-- Chọn workspace --</option>
                    {workspaces.map(ws => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>
                </div>

            {/* Share to All Members */}
            <div className="mb-3">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="shareToAll"
                  checked={shareToAll}
                  onChange={(e) => setShareToAll(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="shareToAll">
                  Chia sẻ cho tất cả thành viên workspace
                </label>
              </div>
              
              {shareToAll && (
                <div className="mt-2">
                  <label className="form-label">Quyền mặc định:</label>
                  <select 
                    className="form-select form-select-sm" 
                    value={defaultPermission}
                    onChange={(e) => setDefaultPermission(e.target.value)}
                  >
                    <option value="view">Chỉ xem</option>
                    <option value="edit">Xem và chỉnh sửa</option>
                  </select>
                </div>
              )}
            </div>

            {/* Specific User Permissions */}
            {!shareToAll && (
              <div className="mb-3">
                <label className="form-label">Quyền cho từng thành viên:</label>
                <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {availableUsers.map(user => (
                    <div key={user.id} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>{user.name}</strong>
                        <br />
                        <small className="text-muted">{user.email}</small>
                      </div>
                      <div>
                        <div className="form-check form-check-inline">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`view-${user.id}`}
                            checked={viewUsers.includes(user.id)}
                            onChange={() => toggleUserPermission(user.id, 'view')}
                          />
                          <label className="form-check-label" htmlFor={`view-${user.id}`}>
                            Xem
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`edit-${user.id}`}
                            checked={editUsers.includes(user.id)}
                            onChange={() => toggleUserPermission(user.id, 'edit')}
                          />
                          <label className="form-check-label" htmlFor={`edit-${user.id}`}>
                            Chỉnh sửa
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Hủy
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleShare}
              disabled={loading || !selectedWorkspace}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Đang chia sẻ...
                </>
              ) : (
                <>
                  <i className="bi bi-share me-2"></i>
                  Chia sẻ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareToWorkspaceModal;
