import React from 'react'

const ConfirmDeleteModal = ({ show, onHide, onConfirm, taskTitle, loading }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onHide()
    }
  }

  if (!show) return null

  return (
    <div 
      className="modal show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Xác nhận xóa
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
              disabled={loading}
            ></button>
          </div>
          
          <div className="modal-body">
            <p className="mb-3">
              Bạn có chắc chắn muốn xóa nhiệm vụ này không?
            </p>
            <div className="alert alert-light border">
              <strong>"{taskTitle}"</strong>
            </div>
            <p className="text-muted small mb-0">
              <i className="bi bi-info-circle me-1"></i>
              Hành động này không thể hoàn tác.
            </p>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onHide}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-2"></i>
                  Xóa nhiệm vụ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
