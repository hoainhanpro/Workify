import React, { useState, useEffect } from 'react'
import TagSelector from './TagSelector'

const EditTaskModal = ({ show, onHide, task, onTaskUpdated, availableTags }) => {  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    tags: [],
    dueDate: '',
    syncWithCalendar: false,
    subTasks: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [subTaskInput, setSubTaskInput] = useState('')
  const [showSubTasks, setShowSubTasks] = useState(false)  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      const formattedDueDate = task.dueDate ? 
        new Date(task.dueDate).toISOString().slice(0, 16) : '';
      
      // Convert tag names to tag IDs for TagSelector if needed
      let tagIds = task.tags || [];
      if (availableTags && availableTags.length > 0 && task.tags && task.tags.length > 0) {
        // Check if tags are names (string) or IDs by trying to find matches
        const isTagNames = task.tags.some(tag => 
          availableTags.some(availableTag => availableTag.name === tag)
        );
        
        if (isTagNames) {
          // Convert tag names to tag IDs
          tagIds = task.tags
            .map(tagName => {
              const found = availableTags.find(t => t.name === tagName);
              return found ? found.id : null;
            })
            .filter(id => id !== null);
        }
      }
      
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        tags: tagIds,
        dueDate: formattedDueDate,
        syncWithCalendar: task.syncWithCalendar || false,
        subTasks: task.subTasks || [],
      })
      setShowSubTasks(task.subTasks && task.subTasks.length > 0)
    }
  }, [task, availableTags])

  // Close modal on ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && show && !loading) {
        handleClose()
      }
    }

    if (show) {
      document.addEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'unset'
    }
  }, [show, loading])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddTag = (tagId) => {
    if (!formData.tags.includes(tagId)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagId]
      }))
    }
  }

  const handleRemoveTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagId)
    }))
  }

  const handleAddSubTask = (e) => {
    e.preventDefault()
    if (subTaskInput.trim()) {
      const newSubTask = {
        id: Date.now().toString(), // Temporary ID for new subtasks
        title: subTaskInput.trim(),
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
      }
      setFormData(prev => {
        const updatedSubTasks = [...prev.subTasks, newSubTask];
        
        // Auto-update main task status when adding subtask
        let newStatus = prev.status;
        if (updatedSubTasks.length > 0) {
          // If we have at least one subtask, and main task is COMPLETED, set to IN_PROGRESS
          if (prev.status === 'COMPLETED') {
            newStatus = 'IN_PROGRESS';
          }
        }
        
        return {
          ...prev,
          status: newStatus,
          subTasks: updatedSubTasks
        };
      });
      setSubTaskInput('')
    }
  }

  const handleRemoveSubTask = (subTaskId) => {
    setFormData(prev => {
      const updatedSubTasks = prev.subTasks.filter(subTask => subTask.id !== subTaskId);
      
      // Auto-update main task status when removing subtask
      let newStatus = prev.status;
      if (updatedSubTasks.length === 0) {
        // No subtasks left, can keep current status or set to TODO
        // Keep current status as user might have set it manually
      } else {
        // Recalculate status based on remaining subtasks
        const completedSubTasks = updatedSubTasks.filter(st => st.status === 'COMPLETED');
        const inProgressSubTasks = updatedSubTasks.filter(st => st.status === 'IN_PROGRESS');
        
        if (completedSubTasks.length === updatedSubTasks.length) {
          // All remaining subtasks completed
          newStatus = 'COMPLETED';
        } else if (completedSubTasks.length > 0 || inProgressSubTasks.length > 0) {
          // Some remaining subtasks in progress or completed
          newStatus = 'IN_PROGRESS';
        } else {
          // All remaining subtasks are TODO
          newStatus = 'TODO';
        }
      }
      
      return {
        ...prev,
        status: newStatus,
        subTasks: updatedSubTasks
      };
    });
  }

  const handleSubTaskChange = (subTaskId, field, value) => {
    setFormData(prev => {
      const updatedSubTasks = prev.subTasks.map(subTask =>
        subTask.id === subTaskId ? { ...subTask, [field]: value } : subTask
      );
      
      // Auto-update main task status when subtask status changes
      let newStatus = prev.status;
      if (field === 'status' && updatedSubTasks.length > 0) {
        const completedSubTasks = updatedSubTasks.filter(st => st.status === 'COMPLETED');
        const inProgressSubTasks = updatedSubTasks.filter(st => st.status === 'IN_PROGRESS');
        
        if (completedSubTasks.length === updatedSubTasks.length) {
          // All subtasks completed
          newStatus = 'COMPLETED';
        } else if (completedSubTasks.length > 0 || inProgressSubTasks.length > 0) {
          // Some subtasks in progress or completed
          newStatus = 'IN_PROGRESS';
        } else {
          // All subtasks are TODO
          newStatus = 'TODO';
        }
      }
      
      return {
        ...prev,
        status: newStatus,
        subTasks: updatedSubTasks
      };
    });
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Tiêu đề là bắt buộc')
      }      // Process form data before sending
      const processedData = { ...formData }
      
      // Convert tag IDs back to tag names for backend
      if (processedData.tags && processedData.tags.length > 0 && availableTags && availableTags.length > 0) {
        processedData.tags = processedData.tags
          .map(tagId => {
            const found = availableTags.find(t => t.id === tagId);
            return found ? found.name : tagId; // Fallback to original if not found
          });
      }
      
      // Convert due date to ISO string if provided
      if (processedData.dueDate) {
        const date = new Date(processedData.dueDate)
        processedData.dueDate = date.toISOString()
      }
      
      // Process subtasks due dates
      if (processedData.subTasks && processedData.subTasks.length > 0) {
        processedData.subTasks = processedData.subTasks.map(subTask => {
          if (subTask.dueDate) {
            const date = new Date(subTask.dueDate)
            return { ...subTask, dueDate: date.toISOString() }
          }
          return subTask
        })
      }

      const result = await onTaskUpdated(task.id, processedData)
      
      if (result && result.success) {
        onHide()
      }
    } catch (err) {
      console.error('Error updating task:', err)
      setError(err.message || 'Có lỗi xảy ra khi cập nhật nhiệm vụ')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError('')
      onHide()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose()
    }
  }

  if (!show || !task) return null

  return (
    <div 
      className="modal show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pencil me-2"></i>
              Chỉnh sửa nhiệm vụ
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {/* Title */}
              <div className="mb-3">
                <label className="form-label">
                  Tiêu đề <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề nhiệm vụ..."
                  maxLength={200}
                  required
                  disabled={loading}
                />
                <div className="form-text">
                  {formData.title.length}/200 ký tự
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-control"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả chi tiết nhiệm vụ..."
                  maxLength={1000}
                  disabled={loading}
                />
                <div className="form-text">
                  {formData.description.length}/1000 ký tự
                </div>
              </div>

              <div className="row">
                {/* Priority */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Độ ưu tiên</label>
                    <select
                      className="form-select"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HIGH">Cao</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="TODO">Chưa bắt đầu</option>
                      <option value="IN_PROGRESS">Đang thực hiện</option>
                      <option value="COMPLETED">Hoàn thành</option>
                    </select>
                    {formData.subTasks && formData.subTasks.length > 0 && (
                      <div className="form-text text-info">
                        <i className="bi bi-info-circle me-1"></i>
                        Trạng thái sẽ được cập nhật tự động dựa trên tiến độ công việc con
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Due Date and Calendar Sync */}
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label">Hạn hoàn thành</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <div className="form-text">
                      Chọn ngày và giờ hoàn thành nhiệm vụ
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="editSyncWithCalendar"
                        name="syncWithCalendar"
                        checked={formData.syncWithCalendar}
                        onChange={(e) => setFormData(prev => ({ ...prev, syncWithCalendar: e.target.checked }))
                        }
                        disabled={loading || !formData.dueDate}
                      />
                      <label className="form-check-label" htmlFor="editSyncWithCalendar">
                        Đồng bộ với Google Calendar
                      </label>
                    </div>
                    {!formData.dueDate && (
                      <div className="form-text text-muted">
                        Cần có hạn hoàn thành để đồng bộ
                      </div>
                    )}
                  </div>                </div>              </div>

              {/* Tags */}
              <div className="mb-3">
                <label className="form-label">Tags</label>
                <TagSelector
                  availableTags={availableTags || []}
                  selectedTags={formData.tags}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                  disabled={loading}
                />
                <div className="form-text">
                  Chọn tag để phân loại nhiệm vụ
                </div>
              </div>

              {/* Subtasks */}
              <div className="mb-3">
                <label className="form-label">
                  Công việc con
                  {formData.subTasks && formData.subTasks.length > 0 && (
                    <span className="badge bg-light text-dark ms-2">
                      {formData.subTasks.filter(st => st.status === 'COMPLETED').length}/{formData.subTasks.length}
                    </span>
                  )}
                </label>
                
                {/* Progress bar for subtasks */}
                {formData.subTasks && formData.subTasks.length > 0 && (
                  <div className="mb-2">
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className={`progress-bar ${
                          formData.subTasks.filter(st => st.status === 'COMPLETED').length === formData.subTasks.length 
                            ? 'bg-success' 
                            : formData.subTasks.filter(st => st.status === 'COMPLETED').length > 0 
                              ? 'bg-warning' 
                              : 'bg-secondary'
                        }`}
                        style={{ 
                          width: `${(formData.subTasks.filter(st => st.status === 'COMPLETED').length / formData.subTasks.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-graph-up me-1"></i>
                      Tiến độ: {Math.round((formData.subTasks.filter(st => st.status === 'COMPLETED').length / formData.subTasks.length) * 100)}%
                    </small>
                  </div>
                )}
                
                <div className="mb-2">                  <button
                    type="button"
                    className={`btn btn-sm ${showSubTasks ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                    onClick={() => setShowSubTasks(prev => !prev)}
                    disabled={loading}
                  >
                    <i className={`bi ${showSubTasks ? 'bi-eye-slash' : 'bi-list-task'} me-1`}></i>
                    {showSubTasks ? 'Ẩn công việc con' : 'Hiện công việc con'}
                  </button>
                </div>

                {showSubTasks && (
                  <div className="border p-3 rounded">
                    {/* Existing subtasks */}
                    {formData.subTasks.length === 0 ? (
                      <div className="text-center text-muted py-3">
                        Chưa có công việc con nào. Nhấn vào nút bên dưới để thêm.
                      </div>
                    ) : (
                      formData.subTasks.map((subTask, index) => (
                        <div key={subTask.id} className="border-bottom py-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>Công việc con {index + 1}:</strong> {subTask.title}
                            </div>
                            <button
                              type="button"
                              className="btn-close"
                              onClick={() => handleRemoveSubTask(subTask.id)}
                              disabled={loading}
                            ></button>
                          </div>                          <div className="mt-2">
                            <div className="row g-2">
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Tiêu đề công việc con"
                                  value={subTask.title}
                                  onChange={(e) => handleSubTaskChange(subTask.id, 'title', e.target.value)}
                                  disabled={loading}
                                />
                              </div>
                              <div className="col-md-3">
                                <select
                                  className="form-select"
                                  value={subTask.status || 'TODO'}
                                  onChange={(e) => handleSubTaskChange(subTask.id, 'status', e.target.value)}
                                  disabled={loading}
                                >
                                  <option value="TODO">Chưa bắt đầu</option>
                                  <option value="IN_PROGRESS">Đang thực hiện</option>
                                  <option value="COMPLETED">Hoàn thành</option>
                                </select>
                              </div>
                              <div className="col-md-3">
                                <select
                                  className="form-select"
                                  value={subTask.priority || 'MEDIUM'}
                                  onChange={(e) => handleSubTaskChange(subTask.id, 'priority', e.target.value)}
                                  disabled={loading}
                                >
                                  <option value="LOW">Thấp</option>
                                  <option value="MEDIUM">Trung bình</option>
                                  <option value="HIGH">Cao</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {/* New subtask input */}                    <div className="mt-3">
                      <div>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập công việc con và nhấn Enter..."
                            value={subTaskInput}
                            onChange={(e) => setSubTaskInput(e.target.value)}
                            disabled={loading}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddSubTask(e)
                              }
                            }}
                          />
                          <button 
                            type="button"
                            className="btn btn-primary"
                            disabled={loading}
                            onClick={handleAddSubTask}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose} 
                disabled={loading}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Cập nhật nhiệm vụ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditTaskModal
