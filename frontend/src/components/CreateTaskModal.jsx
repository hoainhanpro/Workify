import React, { useState, useEffect } from 'react'
import TagSelector from './TagSelector' // Import TagSelector component

const CreateTaskModal = ({ show, onHide, onTaskCreated, availableTags }) => {  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    tags: [],
    dueDate: '',
    syncWithCalendar: false,
    subTasks: [],
  });
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [subTaskInput, setSubTaskInput] = useState('')
  const [showSubTasks, setShowSubTasks] = useState(false)

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
    }

    return () => {
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
        id: Date.now().toString(), // Temporary ID
        title: subTaskInput.trim(),
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
      }
      setFormData(prev => ({
        ...prev,
        subTasks: [...prev.subTasks, newSubTask]
      }))
      setSubTaskInput('')
    }
  }

  const handleRemoveSubTask = (subTaskId) => {
    setFormData(prev => ({
      ...prev,
      subTasks: prev.subTasks.filter(subTask => subTask.id !== subTaskId)
    }))
  }

  const handleSubTaskChange = (subTaskId, field, value) => {
    setFormData(prev => ({
      ...prev,
      subTasks: prev.subTasks.map(subTask =>
        subTask.id === subTaskId ? { ...subTask, [field]: value } : subTask
      )
    }))
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
      
      // Convert tag IDs to tag names for backend
      if (processedData.tags && processedData.tags.length > 0 && availableTags.length > 0) {
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

      const result = await onTaskCreated(processedData)
      
      if (result && result.success) {        // Reset form
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          status: 'TODO',
          tags: [],
          dueDate: '',
          syncWithCalendar: false,
          subTasks: [],
        })
        setTagInput('')
        setSubTaskInput('')
        setShowSubTasks(false)
        onHide()
      }
    } catch (err) {
      console.error('Error creating task:', err)
      setError(err.message || 'Có lỗi xảy ra khi tạo nhiệm vụ')
    } finally {
      setLoading(false)
    }
  }
  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        tags: [],
        dueDate: '',
        syncWithCalendar: false,
        subTasks: [],
      })
      setTagInput('')
      setSubTaskInput('')
      setShowSubTasks(false)
      setError('')
      onHide()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose()
    }
  }

  if (!show) return null

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
              <i className="bi bi-plus-circle me-2"></i>
              Tạo nhiệm vụ mới
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
                        id="syncWithCalendar"
                        name="syncWithCalendar"
                        checked={formData.syncWithCalendar}
                        onChange={(e) => setFormData(prev => ({ ...prev, syncWithCalendar: e.target.checked }))
                        }
                        disabled={loading || !formData.dueDate}
                      />
                      <label className="form-check-label" htmlFor="syncWithCalendar">
                        Đồng bộ với Google Calendar
                      </label>
                    </div>
                    {!formData.dueDate && (
                      <div className="form-text text-muted">
                        Cần có hạn hoàn thành để đồng bộ
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-3">
                <label className="form-label">Thẻ tag</label>                <TagSelector
                  selectedTagIds={formData.tags}
                  onTagsChange={(newTagIds) => setFormData(prev => ({ ...prev, tags: newTagIds }))}
                  availableTags={availableTags}
                />
              </div>

              {/* Subtasks */}
              <div className="mb-3">
                <label className="form-label">Công việc con</label>
                <div>                  <button
                    type="button"
                    className={`btn btn-sm ${showSubTasks ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                    onClick={() => setShowSubTasks(prev => !prev)}
                    disabled={loading}
                  >
                    <i className={`bi ${showSubTasks ? 'bi-eye-slash' : 'bi-plus-square'} me-1`}></i>
                    {showSubTasks ? 'Ẩn công việc con' : 'Thêm công việc con'}
                  </button>
                </div>

                {showSubTasks && (
                  <div className="mt-3">
                    {formData.subTasks.length === 0 && (
                      <div className="text-muted">
                        Chưa có công việc con nào. Nhấn{" "}
                        <a
                          href="#"
                          onClick={() => setShowSubTasks(true)}
                          className="link-primary"
                        >
                          vào đây
                        </a>{" "}
                        để thêm công việc con.
                      </div>
                    )}

                    {formData.subTasks.map((subTask, index) => (
                      <div key={subTask.id} className="card mb-2">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <h6 className="card-title mb-0">
                              Công việc con {index + 1}
                            </h6>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger ms-auto"
                              onClick={() => handleRemoveSubTask(subTask.id)}
                              disabled={loading}
                              title="Xóa công việc con"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>

                          <div className="row g-2">
                            <div className="col">
                              <div className="form-group">
                                <label className="form-label">
                                  Tiêu đề công việc con
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={subTask.title}
                                  onChange={(e) =>
                                    handleSubTaskChange(
                                      subTask.id,
                                      'title',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nhập tiêu đề công việc con..."
                                  disabled={loading}
                                />
                              </div>
                            </div>

                            <div className="col-auto">
                              <div className="form-group">
                                <label className="form-label">
                                  Trạng thái
                                </label>
                                <select
                                  className="form-select"
                                  value={subTask.status}
                                  onChange={(e) =>
                                    handleSubTaskChange(
                                      subTask.id,
                                      'status',
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <option value="TODO">Chưa bắt đầu</option>
                                  <option value="IN_PROGRESS">Đang thực hiện</option>
                                  <option value="COMPLETED">Hoàn thành</option>
                                </select>
                              </div>
                            </div>

                            <div className="col-auto">
                              <div className="form-group">
                                <label className="form-label">
                                  Độ ưu tiên
                                </label>
                                <select
                                  className="form-select"
                                  value={subTask.priority}
                                  onChange={(e) =>
                                    handleSubTaskChange(
                                      subTask.id,
                                      'priority',
                                      e.target.value
                                    )
                                  }
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
                      </div>
                    ))}                    <div>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={subTaskInput}
                          onChange={(e) => setSubTaskInput(e.target.value)}
                          placeholder="Nhập tiêu đề công việc con mới..."
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
                          <i className="bi bi-plus-circle"></i>
                        </button>
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
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Tạo nhiệm vụ
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

export default CreateTaskModal
