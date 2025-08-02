import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useTasks } from '../hooks/useTasks'
import TaskList from '../components/TaskList'
import CreateTaskModal from '../components/CreateTaskModal'
import EditTaskModal from '../components/EditTaskModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import WorkspaceQuickAccess from '../components/WorkspaceQuickAccess'

const Dashboard = () => {
  const { user } = useAuthContext()
  const { tasks, statistics, loading, error, createTask, updateTask, deleteTask } = useTasks()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Get recent tasks (latest 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)

  const handleCreateTask = async (taskData) => {
    try {
      const result = await createTask(taskData)
      return result
    } catch (error) {
      throw error
    }
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setShowEditModal(true)
  }

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const result = await updateTask(taskId, taskData)
      return result
    } catch (error) {
      throw error
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      const result = await deleteTask(taskId)
      return result
    } catch (error) {
      throw error
    }
  }

  const handleDeleteClick = (task) => {
    setSelectedTask(task)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedTask) return
    
    setDeleteLoading(true)
    try {
      await handleDeleteTask(selectedTask.id)
      setShowDeleteModal(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Có lỗi xảy ra khi xóa nhiệm vụ. Vui lòng thử lại.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">Chào mừng trở lại, {user?.fullName || user?.username}!</h1>
              <p className="text-muted mb-0">Hãy bắt đầu ngày làm việc hiệu quả</p>
            </div>
            <div className="text-end">
              <small className="text-muted">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Quick Stats */}
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-check2-square text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Nhiệm vụ hoàn thành</h6>
                  <h4 className="mb-0">{loading ? '...' : statistics.completed}</h4>
                  <small className="text-success">Đã hoàn thành</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-clock text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Đang thực hiện</h6>
                  <h4 className="mb-0">{loading ? '...' : statistics.inProgress}</h4>
                  <small className="text-muted">Đang làm việc</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-secondary bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-list-task text-secondary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Chưa bắt đầu</h6>
                  <h4 className="mb-0">{loading ? '...' : statistics.todo}</h4>
                  <small className="text-muted">Cần thực hiện</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                    <i className="bi bi-trophy text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Tổng nhiệm vụ</h6>
                  <h4 className="mb-0">{loading ? '...' : statistics.total}</h4>
                  <small className="text-success">
                    {statistics.total > 0 ? `${Math.round((statistics.completed / statistics.total) * 100)}% hoàn thành` : 'Chưa có task'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        {/* Recent Tasks */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="mb-0">Nhiệm vụ gần đây</h5>
            </div>
            <div className="card-body">
              <TaskList 
                tasks={recentTasks} 
                loading={loading} 
                error={error}
                showActions={true}
                onTaskUpdate={updateTask}
                onTaskEdit={handleEditTask}
                onTaskDelete={handleDeleteClick}
              />
              <div className="text-center mt-3">
                <Link to="/workify/tasks" className="btn btn-outline-primary">
                  <i className="bi bi-list-ul me-2"></i>
                  Xem tất cả nhiệm vụ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="mb-0">Hành động nhanh</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Tạo nhiệm vụ mới
                </button>
                <Link to="/workify/notes" className="btn btn-outline-primary">
                  <i className="bi bi-journal-plus me-2"></i>
                  Thêm ghi chú
                </Link>
                <Link to="/workify/workspaces" className="btn btn-outline-success">
                  <i className="bi bi-people me-2"></i>
                  Quản lý Workspace
                </Link>
                <button className="btn btn-outline-primary">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Lên lịch họp
                </button>
              </div>
            </div>
          </div>
          
          {/* Workspace Quick Access */}
          <div className="mt-4">
            <WorkspaceQuickAccess />
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onTaskCreated={handleCreateTask}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onTaskUpdated={handleUpdateTask}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false)
          setSelectedTask(null)
        }}
        onConfirm={handleConfirmDelete}
        taskTitle={selectedTask?.title || ''}
        loading={deleteLoading}
      />
    </div>
  )
}

export default Dashboard
