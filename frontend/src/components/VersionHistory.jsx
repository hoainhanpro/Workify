import React, { useState, useEffect } from 'react'
import noteService from '../services/noteService'

const VersionHistory = ({ noteId, onRestore, onClose }) => {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    loadVersionHistory()
  }, [noteId])

  const loadVersionHistory = async () => {
    try {
      setLoading(true)
      const response = await noteService.getNoteVersionHistory(noteId)
      
      if (response.success) {
        setVersions(response.data || [])
      } else {
        setError('Không thể tải lịch sử phiên bản')
      }
    } catch (err) {
      console.error('Error loading version history:', err)
      setError('Lỗi khi tải lịch sử phiên bản')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (versionIndex) => {
    if (window.confirm(`Bạn có chắc muốn khôi phục về phiên bản này? Phiên bản hiện tại sẽ được lưu vào lịch sử.`)) {
      try {
        setRestoring(true)
        const response = await noteService.restoreNoteToVersion(noteId, versionIndex)
        
        if (response.success) {
          alert('Khôi phục thành công!')
          onRestore(response.data) // Gọi callback để cập nhật note trong parent component
          onClose() // Đóng modal
        } else {
          setError(response.message || 'Lỗi khi khôi phục')
        }
      } catch (err) {
        console.error('Error restoring version:', err)
        setError('Lỗi khi khôi phục phiên bản')
      } finally {
        setRestoring(false)
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getContentPreview = (content) => {
    // Remove HTML tags and get first 100 characters
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent
  }

  if (loading) {
    return (
      <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">📜 Lịch sử phiên bản</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Đang tải lịch sử phiên bản...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">📜 Lịch sử phiên bản ({versions.length} phiên bản)</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            {versions.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-clock-history fs-1 text-muted"></i>
                <p className="text-muted mt-2">Chưa có lịch sử phiên bản nào</p>
                <small className="text-muted">
                  Lịch sử sẽ được tự động lưu khi bạn chỉnh sửa note
                </small>
              </div>
            ) : (
              <div className="version-history-list" style={{maxHeight: '400px', overflowY: 'auto'}}>
                {versions.map((version, index) => (
                  <div 
                    key={index} 
                    className={`card mb-3 ${selectedVersion === index ? 'border-primary' : ''}`}
                    style={{cursor: 'pointer'}}
                    onClick={() => setSelectedVersion(selectedVersion === index ? null : index)}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="card-title mb-1">
                            <i className="bi bi-clock-history me-2"></i>
                            Phiên bản #{versions.length - index}
                          </h6>
                          <p className="text-muted small mb-2">
                            {formatDate(version.timestamp)}
                          </p>
                          {version.changeDescription && (
                            <p className="text-info small mb-2">
                              <i className="bi bi-info-circle me-1"></i>
                              {version.changeDescription}
                            </p>
                          )}
                          <p className="card-text small text-muted">
                            {getContentPreview(version.content)}
                          </p>
                        </div>
                        <div className="ms-3">
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRestore(index)
                            }}
                            disabled={restoring}
                          >
                            {restoring ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="bi bi-arrow-counterclockwise me-1"></i>
                            )}
                            Khôi phục
                          </button>
                        </div>
                      </div>
                      
                      {selectedVersion === index && (
                        <div className="mt-3 pt-3 border-top">
                          <h6>Nội dung đầy đủ:</h6>
                          <div 
                            className="border rounded p-3 bg-light small"
                            style={{maxHeight: '200px', overflowY: 'auto'}}
                            dangerouslySetInnerHTML={{__html: version.content}}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VersionHistory
