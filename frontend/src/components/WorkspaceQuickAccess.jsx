import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import workspaceService from '../services/workspaceService';

const WorkspaceQuickAccess = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const data = await workspaceService.getAllWorkspaces();
      // Chỉ lấy 3 workspace đầu tiên
      setWorkspaces(data.slice(0, 3));
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'OWNER': return 'bi-crown-fill text-warning';
      case 'ADMIN': return 'bi-shield-fill text-info';
      case 'EDITOR': return 'bi-pencil-fill text-primary';
      case 'VIEWER': return 'bi-eye-fill text-secondary';
      default: return 'bi-person text-muted';
    }
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent border-0 pt-4 px-4">
          <h6 className="mb-0">
            <i className="bi bi-building me-2"></i>
            Workspace của tôi
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent border-0 pt-4 px-4">
          <h6 className="mb-0">
            <i className="bi bi-building me-2"></i>
            Workspace của tôi
          </h6>
        </div>
        <div className="card-body text-center">
          <i className="bi bi-folder2-open text-muted mb-2" style={{ fontSize: '2rem' }}></i>
          <p className="text-muted mb-3">Chưa có workspace nào</p>
          <Link to="/workify/workspaces" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-plus me-1"></i>
            Tạo Workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-transparent border-0 pt-4 px-4">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="bi bi-building me-2"></i>
            Workspace của tôi
          </h6>
          <Link to="/workify/workspaces" className="text-decoration-none small">
            Xem tất cả
          </Link>
        </div>
      </div>
      <div className="card-body">
        <div className="list-group list-group-flush">
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="list-group-item border-0 px-0 py-2">
              <div className="d-flex align-items-center">
                <div className="workspace-avatar me-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                    style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1 text-truncate" style={{ maxWidth: '120px' }}>
                    {workspace.name}
                  </h6>
                  <small className="text-muted d-flex align-items-center">
                    <i className={`${getRoleIcon(workspace.userRole)} me-1`}></i>
                    {workspace.userRole}
                  </small>
                </div>
                <div className="ms-auto">
                  <Link 
                    to="/workify/workspaces" 
                    className="btn btn-outline-primary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {workspaces.length > 0 && (
          <div className="mt-3">
            <Link 
              to="/workify/workspaces" 
              className="btn btn-outline-success btn-sm w-100"
            >
              <i className="bi bi-plus me-1"></i>
              Tạo Workspace mới
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceQuickAccess;
