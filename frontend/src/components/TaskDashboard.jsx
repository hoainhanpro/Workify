import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import './TaskDashboard.css';

const TaskDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [dueTodayTasks, setDueTodayTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const [analyticsRes, dueTodayRes, overdueRes] = await Promise.all([
        taskService.getTaskAnalytics().catch(err => {
          console.warn('Analytics failed:', err);
          return { success: false, error: err.message };
        }),
        taskService.getTasksDueToday().catch(err => {
          console.warn('Due today tasks failed:', err);
          return { success: false, error: err.message };
        }),
        taskService.getOverdueTasks().catch(err => {
          console.warn('Overdue tasks failed:', err);
          return { success: false, error: err.message };
        }),
      ]);

      // Set data if successful, otherwise use defaults
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      } else {
        // Set default analytics data
        setAnalytics({
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          todoTasks: 0,
          overdueTasks: 0,
          calendarSyncedTasks: 0
        });
      }
      
      if (dueTodayRes.success) setDueTodayTasks(dueTodayRes.data || []);
      if (overdueRes.success) setOverdueTasks(overdueRes.data || []);
      
    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError('Một số dữ liệu không thể tải được. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAllTasks = async () => {
    try {
      setSyncLoading(true);
      const result = await taskService.syncAllTasksWithCalendar();
      
      if (result.success) {
        alert(`Đồng bộ thành công ${result.successCount}/${result.totalTasks} nhiệm vụ với Google Calendar`);
        loadDashboardData(); // Refresh data
      }
    } catch (err) {
      alert('Lỗi đồng bộ: ' + err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TODO': return 'bg-secondary';
      case 'IN_PROGRESS': return 'bg-warning';
      case 'COMPLETED': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'TODO': return 'Chưa bắt đầu';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'COMPLETED': return 'Hoàn thành';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="task-dashboard">
      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      <div className="row">
        {/* Analytics Cards */}
        {analytics && (
          <>
            <div className="col-md-3 mb-4">
              <div className="card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-list-task display-4 text-primary mb-2"></i>
                  <h5 className="card-title">Tổng nhiệm vụ</h5>
                  <h2 className="text-primary">{analytics.totalTasks}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <div className="card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-clock-history display-4 text-warning mb-2"></i>
                  <h5 className="card-title">Quá hạn</h5>
                  <h2 className="text-warning">{analytics.overdueTasks}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <div className="card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-calendar-check display-4 text-success mb-2"></i>
                  <h5 className="card-title">Đồng bộ lịch</h5>
                  <h2 className="text-success">{analytics.calendarSyncedTasks}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <div className="card text-center h-100">
                <div className="card-body">
                  <i className="bi bi-check-circle display-4 text-info mb-2"></i>
                  <h5 className="card-title">Hoàn thành (%)</h5>
                  <h2 className="text-info">
                    {analytics.totalTasks > 0 ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0}%
                  </h2>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="row">
        {/* Calendar Sync Section */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-calendar3 me-2"></i>
                Đồng bộ Google Calendar
              </h5>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSyncAllTasks}
                disabled={syncLoading}
              >
                {syncLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang đồng bộ...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Đồng bộ tất cả
                  </>
                )}
              </button>
            </div>
            <div className="card-body">
              {analytics && (
                <div className="mb-3">
                  <p className="text-muted mb-2">
                    <strong>{analytics.calendarSyncedTasks}</strong> nhiệm vụ đã đồng bộ với Google Calendar
                  </p>
                  <p className="text-muted mb-0">
                    <strong>{analytics.tasksNeedingSync}</strong> nhiệm vụ cần đồng bộ
                  </p>
                </div>
              )}
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Đồng bộ sẽ tạo sự kiện trong Google Calendar cho các nhiệm vụ có hạn hoàn thành.
              </div>
            </div>
          </div>
        </div>

        {/* Due Today Tasks */}
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-calendar-day me-2"></i>
                Hôm nay cần hoàn thành ({dueTodayTasks.length})
              </h5>
            </div>
            <div className="card-body">
              {dueTodayTasks.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="bi bi-check-circle display-4 mb-2"></i>
                  <p>Không có nhiệm vụ nào cần hoàn thành hôm nay!</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dueTodayTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="list-group-item px-0 py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{task.title}</h6>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(task.dueDate)}
                          </small>
                        </div>
                        <span className={`badge ${getStatusBadge(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dueTodayTasks.length > 5 && (
                    <div className="text-center py-2">
                      <small className="text-muted">và {dueTodayTasks.length - 5} nhiệm vụ khác...</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Nhiệm vụ quá hạn ({overdueTasks.length})
                </h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {overdueTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="list-group-item px-0 py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-danger">{task.title}</h6>
                          <small className="text-muted">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Quá hạn: {formatDate(task.dueDate)}
                          </small>
                          {task.subTasks && task.subTasks.length > 0 && (
                            <div className="mt-1">
                              <small className="text-muted">
                                <i className="bi bi-list-task me-1"></i>
                                {task.subTasks.filter(st => st.status === 'COMPLETED').length}/{task.subTasks.length} công việc con hoàn thành
                              </small>
                            </div>
                          )}
                        </div>
                        <div className="text-end">
                          <span className={`badge ${getStatusBadge(task.status)} mb-1`}>
                            {getStatusText(task.status)}
                          </span>
                          {task.syncWithCalendar && (
                            <div>
                              <small className="text-success">
                                <i className="bi bi-calendar-check"></i> Đồng bộ lịch
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {overdueTasks.length > 5 && (
                    <div className="text-center py-2">
                      <small className="text-muted">và {overdueTasks.length - 5} nhiệm vụ quá hạn khác...</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
