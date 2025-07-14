import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../context/AuthContext'
import noteService from '../services/noteService'
import tagService from '../services/tagService'
import RichTextEditor from '../components/RichTextEditor'
import NoteContentDisplay from '../components/NoteContentDisplay'
import TagSelector from '../components/TagSelector'
import TagDisplay from '../components/TagDisplay'
import FileUpload from '../components/FileUpload'
import FileList from '../components/FileList'
import '../styles/TagSelector.css'

const Notes = () => {
  const { user } = useAuthContext()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [noteStats, setNoteStats] = useState(null)
  // Tag filter state
  const [filterType, setFilterType] = useState('all') // 'all', 'pinned', 'tag'
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tagIds: [],
    isPinned: false
  })
  
  // GĐ7: File upload states
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0)
  const [showFileUpload, setShowFileUpload] = useState(false)

  // Load notes khi component mount
  useEffect(() => {
    loadNotes()
    loadNoteStats()
    loadAvailableTags()
  }, [])

  // Load notes when filter changes
  useEffect(() => {
    loadNotes()
  }, [filterType, selectedTagIds])

  const loadNotes = async () => {
    try {
      setLoading(true)
      let response
      
      // Load notes theo filter type
      if (filterType === 'pinned') {
        response = await noteService.getPinnedNotes()
      } else if (filterType === 'tag' && selectedTagIds.length > 0) {
        response = await noteService.searchNotesByTagIds(selectedTagIds)
      } else {
        response = await noteService.getAllNotes()
      }
      
      if (response.success) {
        setNotes(response.data || [])
      }
    } catch (error) {
      console.error('Error loading notes:', error)
      alert('Lỗi khi tải danh sách ghi chú')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableTags = async () => {
    try {
      const response = await tagService.getAllTags()
      setAvailableTags(response.data || response)
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const loadNoteStats = async () => {
    try {
      const response = await noteService.getNoteStats()
      if (response.success) {
        setNoteStats(response.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleCreateNote = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề ghi chú')
      return
    }

    try {
      const response = await noteService.createNote(formData)
      if (response.success) {
        setNotes([response.data, ...notes])
        setFormData({ title: '', content: '', tagIds: [], isPinned: false })
        setShowCreateModal(false)
        loadNoteStats()
        alert('Tạo ghi chú thành công!')
      }
    } catch (error) {
      console.error('Error creating note:', error)
      alert(error.message || 'Lỗi khi tạo ghi chú')
    }
  }

  const handleEditNote = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề ghi chú')
      return
    }

    try {
      const response = await noteService.updateNote(selectedNote.id, formData)
      if (response.success) {
        const updatedNotes = notes.map(note => 
          note.id === selectedNote.id ? response.data : note
        )
        setNotes(updatedNotes)
        setFormData({ title: '', content: '', tagIds: [], isPinned: false })
        setShowEditModal(false)
        setSelectedNote(null)
        loadNoteStats()
        alert('Cập nhật ghi chú thành công!')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      alert(error.message || 'Lỗi khi cập nhật ghi chú')
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      return
    }

    try {
      const response = await noteService.deleteNote(noteId)
      if (response.success) {
        setNotes(notes.filter(note => note.id !== noteId))
        loadNoteStats()
        alert('Xóa ghi chú thành công!')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert(error.message || 'Lỗi khi xóa ghi chú')
    }
  }

  // GĐ7: File upload handlers
  const handleFileUploadSuccess = (result) => {
    alert(result.message || 'Upload file thành công!')
    setFileRefreshTrigger(prev => prev + 1)
    // Refresh notes để cập nhật attachments
    loadNotes()
  }

  const handleFileUploadError = (errorMessage) => {
    alert('Lỗi upload file: ' + errorMessage)
  }

  const handleFileDeleted = (fileName) => {
    alert(`Đã xóa file "${fileName}" thành công!`)
    setFileRefreshTrigger(prev => prev + 1)
    // Refresh notes để cập nhật attachments
    loadNotes()
  }

  const handleFileError = (errorMessage) => {
    alert('Lỗi file: ' + errorMessage)
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadNotes()
      return
    }

    try {
      setLoading(true)
      // GĐ6: Sử dụng API search mới
      const response = await noteService.searchNotesByKeyword(searchKeyword)
      if (response.success) {
        setNotes(response.data || [])
      }
    } catch (error) {
      console.error('Error searching notes:', error)
      alert('Lỗi khi tìm kiếm ghi chú')
    } finally {
      setLoading(false)
    }
  }

  // GĐ5: Xử lý pin/unpin note
  const handleTogglePin = async (noteId) => {
    try {
      const response = await noteService.togglePinNote(noteId)
      if (response.success) {
        setNotes(notes.map(note => 
          note.id === noteId ? { ...note, isPinned: response.data.isPinned } : note
        ))
        alert(response.data.isPinned ? 'Đã ghim ghi chú' : 'Đã bỏ ghim ghi chú')
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
      alert(error.message || 'Lỗi khi pin/unpin ghi chú')
    }
  }

  // GĐ5: Xử lý thêm tag - replaced with TagSelector
  const handleTagsChange = (newTagIds) => {
    setFormData({ ...formData, tagIds: newTagIds })
  }

  // GĐ5: Xử lý xóa tag - replaced with TagSelector
  const handleRemoveTag = (tagIdToRemove) => {
    setFormData({
      ...formData,
      tagIds: formData.tagIds.filter(id => id !== tagIdToRemove)
    })
  }

  // GĐ8: Export handlers
  const handleExportToPdf = async (noteId, noteTitle) => {
    try {
      await noteService.exportNoteToPdf(noteId)
      alert(`Export PDF thành công cho ghi chú "${noteTitle}"!`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Lỗi khi export PDF: ' + (error.message || 'Lỗi không xác định'))
    }
  }

  const handleExportToDocx = async (noteId, noteTitle) => {
    try {
      await noteService.exportNoteToDocx(noteId)
      alert(`Export DOCX thành công cho ghi chú "${noteTitle}"!`)
    } catch (error) {
      console.error('Error exporting DOCX:', error)
      alert('Lỗi khi export DOCX: ' + (error.message || 'Lỗi không xác định'))
    }
  }

  // GĐ8: Bulk export handler
  const handleBulkExport = async (format) => {
    if (notes.length === 0) {
      alert('Không có ghi chú nào để export')
      return
    }

    const confirmMessage = `Bạn có chắc muốn export tất cả ${notes.length} ghi chú thành ${format.toUpperCase()}? Quá trình này có thể mất vài phút.`
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      const formatName = format === 'pdf' ? 'PDF' : 'DOCX'
      alert(`Bắt đầu export ${notes.length} ghi chú thành ${formatName}. Các file sẽ được tải xuống lần lượt.`)
      
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i]
        try {
          if (format === 'pdf') {
            await noteService.exportNoteToPdf(note.id)
          } else {
            await noteService.exportNoteToDocx(note.id)
          }
          
          // Add small delay between downloads to avoid overwhelming the browser
          if (i < notes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        } catch (error) {
          console.error(`Error exporting note ${note.title}:`, error)
          // Continue with other notes even if one fails
        }
      }
      
      alert(`Hoàn tất export ${notes.length} ghi chú thành ${formatName}!`)
    } catch (error) {
      console.error('Error in bulk export:', error)
      alert('Lỗi khi export hàng loạt: ' + (error.message || 'Lỗi không xác định'))
    }
  }

  // GĐ6: Xử lý filter
  const handleFilterChange = (type, tagIds = []) => {
    setFilterType(type)
    setSelectedTagIds(tagIds)
    // Reset search khi thay đổi filter
    setSearchKeyword('')
  }

  // Load notes khi filter thay đổi
  useEffect(() => {
    loadNotes()
  }, [filterType, selectedTagIds])

  const openEditModal = (note) => {
    setSelectedNote(note)
    setFormData({
      title: note.title,
      content: note.content || '',
      tagIds: note.tagIds || [],
      isPinned: note.isPinned || false
    })
    setShowEditModal(true)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedNote(null)
    setFormData({ title: '', content: '', tagIds: [], isPinned: false })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <div className="notes-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Ghi chú</h1>
          <p className="text-muted mb-0">
            Tạo và quản lý ghi chú cá nhân
            {noteStats && (
              <span className="ms-2 badge bg-primary">{noteStats.totalNotes} ghi chú</span>
            )}
          </p>
        </div>
        <div className="d-flex gap-2">
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
              disabled={notes.length === 0}
            >
              <i className="bi bi-download me-2"></i>
              Export
            </button>
            <ul className="dropdown-menu">
              <li>
                <h6 className="dropdown-header">Export tất cả ghi chú</h6>
              </li>
              <li>
                <button 
                  className="dropdown-item"
                  onClick={() => handleBulkExport('pdf')}
                  disabled={notes.length === 0}
                >
                  <i className="bi bi-file-earmark-pdf me-2 text-danger"></i>
                  Tất cả thành PDF
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item"
                  onClick={() => handleBulkExport('docx')}
                  disabled={notes.length === 0}
                >
                  <i className="bi bi-file-earmark-word me-2 text-primary"></i>
                  Tất cả thành DOCX
                </button>
              </li>
            </ul>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Tạo ghi chú mới
          </button>
        </div>
      </div>

      {/* Search và Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm ghi chú..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="btn btn-outline-secondary"
              onClick={handleSearch}
            >
              <i className="bi bi-search"></i>
            </button>
            {searchKeyword && (
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchKeyword('')
                  loadNotes()
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>
        
        {/* GĐ6: Filter buttons */}
        <div className="col-md-6">
          <div className="btn-group" role="group">
            <button 
              className={`btn btn-outline-primary ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              <i className="bi bi-list-ul me-1"></i>Tất cả
            </button>
            <button 
              className={`btn btn-outline-primary ${filterType === 'pinned' ? 'active' : ''}`}
              onClick={() => handleFilterChange('pinned')}
            >
              <i className="bi bi-pin-angle me-1"></i>Đã ghim
            </button>
            <div className="tag-filter-section">
              <label className="form-label small">Lọc theo tags:</label>
              <TagSelector
                selectedTagIds={selectedTagIds}
                onTagsChange={(tagIds) => {
                  setSelectedTagIds(tagIds)
                  if (tagIds.length > 0) {
                    setFilterType('tag')
                  } else {
                    setFilterType('all')
                  }
                }}
                placeholder="Chọn tags để lọc..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Đang tải ghi chú...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-journal-text text-muted" style={{ fontSize: '4rem' }}></i>
          <h5 className="mt-3 text-muted">
            {searchKeyword ? 'Không tìm thấy ghi chú nào' : 'Chưa có ghi chú nào'}
          </h5>
          <p className="text-muted">
            {searchKeyword ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu tạo ghi chú đầu tiên của bạn'}
          </p>
        </div>
      ) : (
        <div className="row">
          {notes.map((note) => (
            <div key={note.id} className="col-lg-6 col-xl-4 mb-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="card-title mb-0 flex-grow-1" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {note.title}
                      {/* GĐ5: Pin indicator */}
                      {note.isPinned && (
                        <i className="bi bi-pin-angle-fill text-warning ms-2" title="Đã ghim"></i>
                      )}
                    </h6>
                    <div className="d-flex align-items-center">
                      {/* GĐ5: Pin button */}
                      <button 
                        className={`btn btn-sm ${note.isPinned ? 'btn-warning' : 'btn-outline-secondary'} border-0 me-2`}
                        onClick={() => handleTogglePin(note.id)}
                        title={note.isPinned ? 'Bỏ ghim' : 'Ghim ghi chú'}
                      >
                        <i className={`bi ${note.isPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}`}></i>
                      </button>
                      <div className="dropdown">
                        <button 
                          className="btn btn-sm btn-outline-secondary border-0"
                          data-bs-toggle="dropdown"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => openEditModal(note)}
                            >
                              <i className="bi bi-pencil me-2"></i>Chỉnh sửa
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          {/* <li>
                            <h6 className="dropdown-header">
                              <i className="bi bi-download me-2"></i>Export
                            </h6>
                          </li> */}
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleExportToPdf(note.id, note.title)}
                            >
                              <i className="bi bi-file-earmark-pdf me-2 text-danger"></i>Xuất PDF
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleExportToDocx(note.id, note.title)}
                            >
                              <i className="bi bi-file-earmark-word me-2 text-primary"></i>Xuất DOCX
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <i className="bi bi-trash me-2"></i>Xóa
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tags display */}
                  {note.tagIds && note.tagIds.length > 0 && (
                    <div className="mb-2">
                      <TagDisplay tagIds={note.tagIds} size="small" />
                    </div>
                  )}
                  
                  {note.content && (
                    <p className="card-text text-muted small" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      <NoteContentDisplay content={note.content} isPreview={true} />
                    </p>
                  )}
                  
                  {/* GĐ7: File attachments indicator */}
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="mb-2">
                      <small className="text-info">
                        <i className="bi bi-paperclip me-1"></i>
                        {note.attachments.length} file đính kèm
                      </small>
                    </div>
                  )}
                  
                  <div className="mt-auto">
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {formatDate(note.updatedAt)}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo ghi chú mới</h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <form onSubmit={handleCreateNote}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tiêu đề <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Nhập tiêu đề ghi chú..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nội dung</label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData({...formData, content})}
                      placeholder="Nhập nội dung ghi chú..."
                      height="300px"
                    />
                  </div>
                  
                  {/* Tags management */}
                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <TagSelector
                      selectedTagIds={formData.tagIds}
                      onTagsChange={handleTagsChange}
                      placeholder="Chọn tags cho ghi chú..."
                    />
                  </div>
                  
                  {/* GĐ5: Pin option */}
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isPinnedCreate"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                      />
                      <label className="form-check-label" htmlFor="isPinnedCreate">
                        <i className="bi bi-pin-angle me-1"></i>Ghim ghi chú này
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {/* <button type="button" className="btn btn-secondary" onClick={closeModals}>
                    Hủy
                  </button> */}
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>Tạo ghi chú
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedNote && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh sửa ghi chú</h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <form onSubmit={handleEditNote}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tiêu đề <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Nhập tiêu đề ghi chú..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nội dung</label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData({...formData, content})}
                      placeholder="Nhập nội dung ghi chú..."
                      height="300px"
                      noteId={selectedNote?.id}
                    />
                  </div>
                  
                  {/* Tags management */}
                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <TagSelector
                      selectedTagIds={formData.tagIds}
                      onTagsChange={handleTagsChange}
                      placeholder="Chọn tags cho ghi chú..."
                    />
                  </div>
                  
                  {/* GĐ5: Pin option */}
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isPinnedEdit"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                      />
                      <label className="form-check-label" htmlFor="isPinnedEdit">
                        <i className="bi bi-pin-angle me-1"></i>Ghim ghi chú này
                      </label>
                    </div>
                  </div>
                  
                  {/* GĐ7: File attachments */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label">File đính kèm</label>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowFileUpload(!showFileUpload)}
                      >
                        <i className="bi bi-paperclip me-1"></i>
                        {showFileUpload ? 'Ẩn upload' : 'Thêm file'}
                      </button>
                    </div>
                    
                    {showFileUpload && (
                      <FileUpload
                        noteId={selectedNote.id}
                        onUploadSuccess={handleFileUploadSuccess}
                        onUploadError={handleFileUploadError}
                      />
                    )}
                    
                    <FileList
                      noteId={selectedNote.id}
                      refreshTrigger={fileRefreshTrigger}
                      onFileDeleted={handleFileDeleted}
                      onError={handleFileError}
                    />
                  </div>
                  
                  {/* GĐ8: Export section */}
                  <div className="mb-3">
                    <label className="form-label">Export ghi chú</label>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleExportToPdf(selectedNote.id, selectedNote.title)}
                      >
                        <i className="bi bi-file-earmark-pdf me-1"></i>
                        Xuất PDF
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleExportToDocx(selectedNote.id, selectedNote.title)}
                      >
                        <i className="bi bi-file-earmark-word me-1"></i>
                        Xuất DOCX
                      </button>
                    </div>
                    <small className="text-muted">
                      Tải xuống ghi chú dưới định dạng PDF hoặc Word để chia sẻ và lưu trữ.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  {/* <button type="button" className="btn btn-secondary" onClick={closeModals}>
                    Hủy
                  </button> */}
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-lg me-2"></i>Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes
