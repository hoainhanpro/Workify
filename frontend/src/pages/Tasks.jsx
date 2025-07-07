import React, { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskList from '../components/TaskList'

const Tasks = () => {
  const { tasks, statistics, loading, error, updateTask } = useTasks()
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTasks = tasks.filter(task => {
    // Filter by status
    if (filter !== 'ALL' && task.status !== filter) {
      return false
    }

    // Filter by search term
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    return true
  })

  const getFilterCount = (status) => {
    switch (status) {
      case 'ALL':
        return tasks.length
      case 'TODO':
        return statistics.todo
      case 'IN_PROGRESS':
        return statistics.inProgress
      case 'COMPLETED':
        return statistics.completed
      default:
        return 0
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
              <button className="btn btn-primary">
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
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm nhiệm vụ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-md-5">
                  <div className="d-flex align-items-center justify-content-between h-100 px-3 py-2 bg-light rounded">
                    <span className="text-muted small">Hiển thị:</span>
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
            <div className="card-body p-0">
              <TaskList 
                tasks={filteredTasks}
                loading={loading}
                error={error}
                showActions={true}
                onTaskUpdate={updateTask}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
