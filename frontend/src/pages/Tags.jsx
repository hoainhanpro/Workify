import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../context/AuthContext'
import tagService from '../services/tagService'
import '../styles/Tags.css'

const Tags = () => {
  const { user } = useAuthContext()
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filteredTags, setFilteredTags] = useState([])
  const [tagStats, setTagStats] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')
  
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
    loadTags()
    loadTagStats()
  }, [])

  useEffect(() => {
    // Filter tags based on search keyword and selected color
    let filtered = tags

    if (searchKeyword.trim()) {
      filtered = filtered.filter(tag => 
        tag.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      )
    }

    if (selectedColor) {
      filtered = filtered.filter(tag => tag.color === selectedColor)
    }

    setFilteredTags(filtered)
  }, [tags, searchKeyword, selectedColor])

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
        alert('Cập nhật tag thành công!')
      } else {
        await tagService.createTag(formData)
        alert('Tạo tag thành công!')
      }
      
      await loadTags()
      await loadTagStats()
      resetForm()
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
      alert('Xóa tag thành công!')
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

  const handleColorFilter = (color) => {
    setSelectedColor(selectedColor === color ? '' : color)
  }

  return (
    <div className="tags-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Quản lý Tags</h1>
          <p className="text-muted mb-0">
            Tạo và quản lý nhãn cho ghi chú và công việc
            {tagStats && (
              <span className="ms-2 badge bg-primary">{tagStats.totalTags || 0} tags</span>
            )}
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>Tạo Tag Mới
        </button>
      </div>

      {/* Stats Cards */}
      {tagStats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">{tagStats.totalTags || 0}</h5>
                <p className="card-text small text-muted">Tổng số tags</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-success">{tagStats.usedTags || 0}</h5>
                <p className="card-text small text-muted">Đang sử dụng</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-info">{tagStats.unusedTags || 0}</h5>
                <p className="card-text small text-muted">Chưa sử dụng</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-warning">{filteredTags.length}</h5>
                <p className="card-text small text-muted">Hiển thị</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm tags..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Lọc theo màu:</span>
            <div className="color-filter-group">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-filter-btn ${selectedColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorFilter(color)}
                  title={`Lọc theo màu ${color}`}
                />
              ))}
              {selectedColor && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary ms-2"
                  onClick={() => setSelectedColor('')}
                >
                  <i className="bi bi-x"></i> Bỏ lọc
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Form Column */}
        <div className="col-md-4">
          {showCreateForm && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  {editingTag ? 'Sửa Tag' : 'Tạo Tag Mới'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Tên tag *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập tên tag..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Màu sắc</label>
                    <div className="color-selector mb-2">
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

                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Mô tả tag (tùy chọn)..."
                      rows="3"
                    />
                  </div>

                  <div className="d-flex gap-2">
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
            </div>
          )}
        </div>

        {/* Tags List Column */}
        <div className={showCreateForm ? 'col-md-8' : 'col-12'}>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-tags display-1 text-muted"></i>
              <h4 className="text-muted mt-3">
                {searchKeyword || selectedColor ? 'Không tìm thấy tag nào' : 'Chưa có tag nào'}
              </h4>
              <p className="text-muted">
                {searchKeyword || selectedColor 
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                  : 'Tạo tag đầu tiên để bắt đầu sử dụng'
                }
              </p>
            </div>
          ) : (
            <div className="row">
              {filteredTags.map(tag => (
                <div key={tag.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="card h-100 tag-card">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                          <span 
                            className="tag-color-indicator me-2"
                            style={{ backgroundColor: tag.color }}
                          ></span>
                          <h6 className="card-title mb-0">{tag.name}</h6>
                        </div>
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            <i className="bi bi-three-dots"></i>
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button 
                                className="dropdown-item"
                                onClick={() => handleEdit(tag)}
                              >
                                <i className="bi bi-pencil me-2"></i>Sửa
                              </button>
                            </li>
                            <li>
                              <button 
                                className="dropdown-item text-danger"
                                onClick={() => handleDelete(tag)}
                              >
                                <i className="bi bi-trash me-2"></i>Xóa
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      {tag.description && (
                        <p className="card-text small text-muted">{tag.description}</p>
                      )}
                      
                      <div className="text-muted small">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(tag.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tags
