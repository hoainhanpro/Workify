import React, { useState, useEffect } from 'react'
import TagSelector from './TagSelector'

const EditTaskModal = ({ show, onHide, task, onTaskUpdated, availableTags }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    tags: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        tags: task.tags || []
      })
    }
  }, [task])

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

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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
      }

      const result = await onTaskUpdated(task.id, formData)
      
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
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-3">
                <label className="form-label">Thẻ tag</label>
                <div className="d-flex gap-2 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Nhập tag và nhấn Enter..."
                    disabled={loading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag(e)
                      }
                    }}
                  />
                  <button 
                    type="button"
                    className="btn btn-outline-primary" 
                    onClick={handleAddTag}
                    disabled={loading || !tagInput.trim()}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="badge bg-secondary d-flex align-items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          className="btn-close btn-close-white"
                          style={{ fontSize: '0.5em' }}
                          onClick={() => handleRemoveTag(tag)}
                          disabled={loading}
                        ></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tag Selector - New Component */}
              <div className="mb-3">
                <label className="form-label">Chọn thẻ tag</label>
                <TagSelector
                  selectedTagIds={formData.tags}
                  onTagsChange={(newTagIds) => setFormData(prev => ({ ...prev, tags: newTagIds }))}
                  availableTags={availableTags}
                  disabled={loading}
                />
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
