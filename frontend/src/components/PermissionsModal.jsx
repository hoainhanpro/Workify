import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import noteService from '../services/noteService';

const PermissionsModal = ({ 
  show, 
  onHide, 
  itemType, // 'task' hoặc 'note'
  itemId, 
  itemTitle,
  workspaceId,
  onPermissionsUpdated
}) => {
  const [permissions, setPermissions] = useState({
    read: false,
    write: false,
    delete: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (show && itemId && workspaceId) {
      loadCurrentPermissions();
    }
    // Reset states khi modal đóng
    if (!show) {
      setError(null);
      setSuccess(false);
    }
  }, [show, itemId, workspaceId]);

  const loadCurrentPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy thông tin chi tiết item để có permissions hiện tại
      let itemData;
      if (itemType === 'task') {
        // Get workspace tasks và tìm task này
        const workspaceTasks = await taskService.getWorkspaceTasksDetailed(workspaceId);
        itemData = workspaceTasks.find(task => task.id === itemId);
      } else {
        // Get workspace notes và tìm note này
        const workspaceNotes = await noteService.getWorkspaceNotesDetailed(workspaceId);
        itemData = workspaceNotes.find(note => note.id === itemId);
      }

      if (itemData && itemData.workspacePermissions) {
        setPermissions({
          read: itemData.workspacePermissions.read || false,
          write: itemData.workspacePermissions.write || false,
          delete: itemData.workspacePermissions.delete || false
        });
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: value
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        workspaceId,
        permissions
      };

      if (itemType === 'task') {
        await taskService.updateTaskPermissions(itemId, updateData);
      } else {
        await noteService.updateNotePermissions(itemId, updateData);
      }

      setSuccess(true);
      if (onPermissionsUpdated) {
        onPermissionsUpdated();
      }

      // Auto close sau 1.5s
      setTimeout(() => {
        onHide();
      }, 1500);

    } catch (error) {
      console.error('Error updating permissions:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getItemTypeText = () => {
    return itemType === 'task' ? 'Task' : 'Note';
  };

  return (
    <div className={`modal ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-shield-lock me-2"></i>
              Cập nhật Quyền {getItemTypeText()}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
            ></button>
          </div>

          <div className="modal-body">
            {itemTitle && (
              <div className="mb-3">
                <strong>{getItemTypeText()}:</strong> {itemTitle}
              </div>
            )}

            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>
                Cập nhật quyền thành công!
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Đang tải quyền hiện tại...</p>
              </div>
            ) : (
              <div>
                <h6 className="mb-3">
                  <i className="bi bi-gear me-2"></i>
                  Cấu hình quyền truy cập
                </h6>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="permission-read"
                      checked={permissions.read}
                      onChange={(e) => handlePermissionChange('read', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="permission-read">
                      <i className="bi bi-eye me-2 text-primary"></i>
                      <strong>Quyền xem (Read)</strong>
                      <br />
                      <small className="text-muted">
                        Cho phép thành viên xem nội dung {getItemTypeText().toLowerCase()}
                      </small>
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="permission-write"
                      checked={permissions.write}
                      onChange={(e) => handlePermissionChange('write', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="permission-write">
                      <i className="bi bi-pencil me-2 text-warning"></i>
                      <strong>Quyền chỉnh sửa (Write)</strong>
                      <br />
                      <small className="text-muted">
                        Cho phép thành viên chỉnh sửa nội dung {getItemTypeText().toLowerCase()}
                      </small>
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="permission-delete"
                      checked={permissions.delete}
                      onChange={(e) => handlePermissionChange('delete', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="permission-delete">
                      <i className="bi bi-trash me-2 text-danger"></i>
                      <strong>Quyền xóa (Delete)</strong>
                      <br />
                      <small className="text-muted">
                        Cho phép thành viên xóa {getItemTypeText().toLowerCase()}
                      </small>
                    </label>
                  </div>
                </div>

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <small>
                    <strong>Lưu ý:</strong> Quyền Write và Delete sẽ tự động bao gồm quyền Read. 
                    Chủ sở hữu {getItemTypeText().toLowerCase()} luôn có đầy đủ quyền.
                  </small>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onHide} 
              disabled={saving}
            >
              Hủy
            </button>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={handleSavePermissions}
              disabled={loading || saving || success}
            >
              {saving ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Đang lưu...
                </>
              ) : success ? (
                <>
                  <i className="bi bi-check me-2"></i>
                  Đã lưu
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-2"></i>
                  Cập nhật quyền
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;
