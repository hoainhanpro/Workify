import React, { useState, useEffect } from 'react'
import tagService from '../services/tagService'

const TagSidebar = ({ isOpen, onClose, onTagsUpdated }) => {
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filteredTags, setFilteredTags] = useState([])
  const [tagStats, setTagStats] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    color: '#007bff',
    description: ''
  })

  // Predefined colors
  const colorOptions = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
  ]

  useEffect(() => {
    if (isOpen) {
      loadTags()
      loadTagStats()
    }
  }, [isOpen])

  useEffect(() => {
    // Filter tags based on search keyword
    if (searchKeyword.trim()) {
      const filtered = tags.filter(tag => 
        tag.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      )
      setFilteredTags(filtered)
    } else {
      setFilteredTags(tags)
    }
  }, [tags, searchKeyword])

  const loadTags = async () => {
    try {
      setIsLoading(true)
      const response = await tagService.getAllTags()
      setTags(response.data || response)
    } catch (error) {
      console.error('Error loading tags:', error)
      alert('Lỗi khi tải danh sách tags')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTagStats = async () => {
    try {
      const response = await tagService.getTagStats()
      setTagStats(response.data || response)
    } catch (error) {
      console.error('Error loading tag stats:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Tên tag không được để trống')
      return
    }

    try {
      setIsLoading(true)
      
      if (editingTag) {
        await tagService.updateTag(editingTag.id, formData)
      } else {
        await tagService.createTag(formData)
      }
      
      await loadTags()
      await loadTagStats()
      resetForm()
      
      // Notify parent component about tags update
      if (onTagsUpdated) {
        onTagsUpdated()
      }
    } catch (error) {
      console.error('Error saving tag:', error)
      alert(error.message || 'Lỗi khi lưu tag')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (tag) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tag "${tag.name}"?`)) {
      return
    }

    try {
      setIsLoading(true)
      await tagService.deleteTag(tag.id)
      await loadTags()
      await loadTagStats()
      
      if (onTagsUpdated) {
        onTagsUpdated()
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      alert(error.message || 'Lỗi khi xóa tag')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#007bff',
      description: ''
    })
    setEditingTag(null)
    setShowCreateForm(false)
  }

  const handleColorSelect = (color) => {
    setFormData({ ...formData, color })
  }

  if (!isOpen) return null

  return (
    <div className="tag-sidebar-overlay">
      <div className="tag-sidebar">
        <div className="tag-sidebar-header">
          <h3>Quản lý Tags</h3>
          <button 
            className="btn btn-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="tag-sidebar-content">
          {/* Stats */}
          {tagStats && (
            <div className="tag-stats">
              <div className="stat-item">
                <span className="stat-number">{tagStats.totalTags || 0}</span>
                <span className="stat-label">Tổng tags</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{tagStats.usedTags || 0}</span>
                <span className="stat-label">Đang sử dụng</span>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="tag-search">
            <div className="search-input-group">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm tags..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="tag-form">
              <h4>{editingTag ? 'Sửa Tag' : 'Tạo Tag Mới'}</h4>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên tag *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập tên tag..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Màu sắc</label>
                  <div className="color-selector">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="form-control color-input"
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả tag (tùy chọn)..."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang lưu...' : (editingTag ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Action Button */}
          {!showCreateForm && (
            <button 
              className="btn btn-primary btn-create-tag"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="bi bi-plus-lg"></i>
              Tạo Tag Mới
            </button>
          )}

          {/* Tags List */}
          <div className="tags-list">
            {isLoading ? (
              <div className="loading">Đang tải...</div>
            ) : filteredTags.length === 0 ? (
              <div className="empty-state">
                {searchKeyword ? 'Không tìm thấy tag nào' : 'Chưa có tag nào'}
              </div>
            ) : (
              filteredTags.map(tag => (
                <div key={tag.id} className="tag-item">
                  <div className="tag-info">
                    <div className="tag-header">
                      <span 
                        className="tag-color-indicator"
                        style={{ backgroundColor: tag.color }}
                      ></span>
                      <span className="tag-name">{tag.name}</span>
                    </div>
                    {tag.description && (
                      <div className="tag-description">{tag.description}</div>
                    )}
                  </div>
                  <div className="tag-actions">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(tag)}
                      title="Sửa tag"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(tag)}
                      title="Xóa tag"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TagSidebar
