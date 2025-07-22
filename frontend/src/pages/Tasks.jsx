import React, { useState, useEffect, useCallback } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskList from '../components/TaskList'
import CreateTaskModal from '../components/CreateTaskModal'
import EditTaskModal from '../components/EditTaskModal'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import taskService from '../services/taskService'
import tagService from '../services/tagService'

const Tasks = () => {
  const { tasks, statistics, loading, error, createTask, updateTask, deleteTask, refreshData } = useTasks()
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState([])

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await tagService.getAllTags()
        setAvailableTags(response.data || response)
      } catch (error) {
        console.error('Error loading tags:', error)
      }
    }
    loadTags()
  }, [])// Refresh function for TaskList
  const handleRefresh = useCallback(async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  }, [refreshData]);

  // Determine which tasks to display
  const displayTasks = isSearching ? searchResults : tasks

  const filteredTasks = displayTasks.filter(task => {
    // Filter by status (only when not searching or search is empty)
    if (filter !== 'ALL' && task.status !== filter) {
      return false
    }
    return true
  })

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        setIsSearching(false)
        setSearchResults([])
        return
      }

      setSearchLoading(true)
      try {
        const response = await taskService.searchTasksByTagId(term)
        if (response.success) {
          setSearchResults(response.data)
          setIsSearching(true)
        }
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
        setIsSearching(false)
      } finally {
        setSearchLoading(false)
      }
    }, 500),
    []
  )

  // Handle search input change
  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm)
    } else {
      setIsSearching(false)
      setSearchResults([])
      setSearchLoading(false)
    }
  }, [searchTerm, debouncedSearch])

  // Simple debounce function
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const getFilterCount = (status) => {
    const tasksToCount = isSearching ? searchResults : tasks
    switch (status) {
      case 'ALL':
        return tasksToCount.length
      case 'TODO':
        return tasksToCount.filter(task => task.status === 'TODO').length
      case 'IN_PROGRESS':
        return tasksToCount.filter(task => task.status === 'IN_PROGRESS').length
      case 'COMPLETED':
        return tasksToCount.filter(task => task.status === 'COMPLETED').length
      default:
        return 0
    }
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setShowEditModal(true)
  }

  const handleCreateTask = async (taskData) => {
    try {
      const result = await createTask(taskData)
      return result
    } catch (error) {
      throw error
    }
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
    <div className="tasks-page">
      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
              <h1 className="h3 mb-1">Quản lý nhiệm vụ</h1>
              <p className="text-muted mb-0">Tổ chức và theo dõi tiến độ công việc của bạn</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                <span className="d-none d-sm-inline">Tạo nhiệm vụ mới</span>
                <span className="d-sm-none">Tạo mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="mb-0 small">Tổng nhiệm vụ</h6>
                  <h4 className="mb-0">{statistics.total}</h4>
                </div>
                <i className="bi bi-list-task fs-1 opacity-50 d-none d-sm-block"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="mb-0 small">Chưa bắt đầu</h6>
                  <h4 className="mb-0">{statistics.todo}</h4>
                </div>
                <i className="bi bi-clock fs-1 opacity-50 d-none d-sm-block"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="mb-0 small">Đang thực hiện</h6>
                  <h4 className="mb-0">{statistics.inProgress}</h4>
                </div>
                <i className="bi bi-arrow-clockwise fs-1 opacity-50 d-none d-sm-block"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="mb-0 small">Hoàn thành</h6>
                  <h4 className="mb-0">{statistics.completed}</h4>
                </div>
                <i className="bi bi-check-circle fs-1 opacity-50 d-none d-sm-block"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* Search Row */}
              <div className="row mb-3">
                <div className="col-lg-8 col-md-7 mb-3 mb-md-0">
                  <div className="input-group">
                    <span className="input-group-text">
                      {searchLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Searching...</span>
                        </div>
                      ) : (
                        <i className="bi bi-search"></i>
                      )}
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm theo tiêu đề, mô tả, tags (vd: #work #urgent) hoặc độ ưu tiên (low, medium, high)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setSearchTerm('')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>
                  {isSearching && (
                    <small className="text-muted mt-1 d-block">
                      <i className="bi bi-info-circle me-1"></i>
                      Hiển thị kết quả tìm kiếm cho "{searchTerm}"
                    </small>
                  )}
                </div>
                <div className="col-lg-4 col-md-5">
                  <div className="d-flex align-items-center justify-content-between h-100 px-3 py-2 bg-light rounded">
                    <span className="text-muted small">
                      {isSearching ? 'Tìm thấy:' : 'Hiển thị:'}
                    </span>
                    <span className="fw-bold">{filteredTasks.length} nhiệm vụ</span>
                  </div>
                </div>
              </div>

              {/* Filter Buttons Row */}
              <div className="row">
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-2 task-filters">
                    <input
                      type="radio"
                      className="btn-check"
                      name="filter"
                      id="all"
                      checked={filter === 'ALL'}
                      onChange={() => setFilter('ALL')}
                    />
                    <label className="btn btn-outline-primary flex-fill" htmlFor="all">
                      <span className="d-none d-sm-inline">Tất cả </span>
                      <span className="d-sm-none">Tất cả </span>
                      <span className="badge bg-primary ms-1">{getFilterCount('ALL')}</span>
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="filter"
                      id="todo"
                      checked={filter === 'TODO'}
                      onChange={() => setFilter('TODO')}
                    />
                    <label className="btn btn-outline-secondary flex-fill" htmlFor="todo">
                      <span className="d-none d-sm-inline">Chưa bắt đầu </span>
                      <span className="d-sm-none">Chưa BĐ </span>
                      <span className="badge bg-secondary ms-1">{getFilterCount('TODO')}</span>
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="filter"
                      id="in_progress"
                      checked={filter === 'IN_PROGRESS'}
                      onChange={() => setFilter('IN_PROGRESS')}
                    />
                    <label className="btn btn-outline-warning flex-fill" htmlFor="in_progress">
                      <span className="d-none d-sm-inline">Đang thực hiện </span>
                      <span className="d-sm-none">Đang TH </span>
                      <span className="badge bg-warning ms-1">{getFilterCount('IN_PROGRESS')}</span>
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="filter"
                      id="completed"
                      checked={filter === 'COMPLETED'}
                      onChange={() => setFilter('COMPLETED')}
                    />
                    <label className="btn btn-outline-success flex-fill" htmlFor="completed">
                      <span className="d-none d-sm-inline">Hoàn thành </span>
                      <span className="d-sm-none">Hoàn thành </span>
                      <span className="badge bg-success ms-1">{getFilterCount('COMPLETED')}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Danh sách nhiệm vụ</h5>
            </div>
            <div className="card-body p-0">              <TaskList 
                tasks={filteredTasks}
                loading={loading}
                error={error}
                showActions={true}
                onTaskUpdate={updateTask}
                onTaskEdit={handleEditTask}
                onTaskDelete={handleDeleteClick}
                onRefresh={handleRefresh}
                onCreateTask={() => setShowCreateModal(true)}
                availableTags={availableTags}
              />
            </div>
          </div>
        </div>
      </div>      {/* Create Task Modal */}
      <CreateTaskModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onTaskCreated={handleCreateTask}
        availableTags={availableTags}
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
        availableTags={availableTags}
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

export default Tasks
