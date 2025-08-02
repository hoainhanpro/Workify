import React, { useState, useEffect } from 'react';
import workspaceService from '../services/workspaceService';

const WorkspaceStatsCard = ({ workspaceId, workspaceName }) => {
  const [stats, setStats] = useState(null);
  const [activitySummary, setActivitySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceData();
    }
  }, [workspaceId]);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats và activity summary parallel
      const [statsResult, activityResult] = await Promise.all([
        workspaceService.getWorkspaceStats(workspaceId),
        workspaceService.getWorkspaceActivitySummary(workspaceId)
      ]);

      setStats(statsResult);
      setActivitySummary(activityResult);
    } catch (error) {
      console.error('Error loading workspace data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải thống kê workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-danger">
        <div className="card-body">
          <div className="alert alert-danger mb-0">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="bi bi-bar-chart"></i> Thống kê Workspace
          {workspaceName && <span className="text-muted ms-2">- {workspaceName}</span>}
        </h5>
      </div>
      <div className="card-body">
        {/* General Stats */}
        {stats && (
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-list-task text-primary fs-4 me-3"></i>
                <div>
                  <h6 className="mb-0">Tổng số Tasks</h6>
                  <span className="h4 text-primary">{stats.totalTasks}</span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-journal-text text-success fs-4 me-3"></i>
                <div>
                  <h6 className="mb-0">Tổng số Notes</h6>
                  <span className="h4 text-success">{stats.totalNotes}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <hr />

        {/* My Activity */}
        {activitySummary && (
          <div>
            <h6 className="mb-3">
              <i className="bi bi-person-circle"></i> Hoạt động của tôi
            </h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <i className="bi bi-person-check text-warning fs-2"></i>
                    <h6 className="mt-2">Tasks được giao</h6>
                    <span className="h5 text-warning">{activitySummary.assignedTasks}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <i className="bi bi-plus-circle text-info fs-2"></i>
                    <h6 className="mt-2">Tasks đã tạo</h6>
                    <span className="h5 text-info">{activitySummary.createdTasks}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <i className="bi bi-eye text-secondary fs-2"></i>
                    <h6 className="mt-2">Notes có thể xem</h6>
                    <span className="h5 text-secondary">{activitySummary.accessibleNotes}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <i className="bi bi-pencil text-primary fs-2"></i>
                    <h6 className="mt-2">Notes đã tạo</h6>
                    <span className="h5 text-primary">{activitySummary.createdNotes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-3">
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={loadWorkspaceData}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Làm mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceStatsCard;
