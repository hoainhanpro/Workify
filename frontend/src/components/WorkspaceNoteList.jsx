import React, { useState, useEffect } from 'react';
import noteService from '../services/noteService';
import ShareToWorkspaceModal from './ShareToWorkspaceModal';
import PermissionsModal from './PermissionsModal';

const WorkspaceNoteList = ({ workspaceId, showActions = true, limit = null }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceNotes();
    }
  }, [workspaceId]);

  const loadWorkspaceNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading workspace notes for workspaceId:', workspaceId);
      const workspaceNotes = await noteService.getWorkspaceNotesDetailed(workspaceId);
      console.log('✅ Received workspace notes:', workspaceNotes);
      
      // Apply limit if specified
      const limitedNotes = limit ? workspaceNotes.slice(0, limit) : workspaceNotes;
      console.log('📋 Setting notes to display:', limitedNotes);
      setNotes(limitedNotes);
    } catch (error) {
      console.error('❌ Error loading workspace notes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareNote = (note) => {
    setSelectedNote(note);
    setShowShareModal(true);
  };

  const handleEditPermissions = (note) => {
    setSelectedNote(note);
    setShowPermissionsModal(true);
  };

  const handleNoteUpdated = () => {
    loadWorkspaceNotes();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Đang tải danh sách notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-inbox fs-1 text-muted"></i>
        <p className="text-muted mt-2">Không có note nào trong workspace này</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          <i className="bi bi-journal-text me-2"></i>
          Notes trong Workspace ({notes.length})
        </h6>
        {limit && notes.length >= limit && (
          <small className="text-muted">Hiển thị {limit} note đầu tiên</small>
        )}
      </div>

      <div className="list-group list-group-flush">
        {notes.map((note, index) => (
          <div key={note.id} className={`list-group-item border-0 py-3 px-3 ${index % 2 !== 1 ? 'bg-body-secondary' : ''}`}>
            <div className="d-flex align-items-start">
              {/* Main Content */}
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
                  {/* Left Content */}
                  <div className="flex-grow-1 min-w-0">
                    <div className="mb-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="mb-0 fw-semibold">
                          {note.title}
                        </h6>
                        
                        {/* Pin indicator */}
                        {note.isPinned && (
                          <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
                            <i className="bi bi-pin-fill me-1"></i>
                            Ghim
                          </span>
                        )}
                      </div>
                      
                      {/* Content preview */}
                      {note.content && (
                        <p className="mb-2 text-muted small lh-sm">
                          {truncateContent(note.content)}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {note.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex} 
                              className="badge text-dark small" 
                              style={{ 
                                backgroundColor: '#e3f2fd', 
                                border: '1px solid #bbdefb',
                                fontSize: '0.7rem'
                              }}
                            >
                              <i className="bi bi-tag me-1"></i>
                              {tag.name || tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span 
                              className="badge bg-secondary text-white small" 
                              style={{ fontSize: '0.7rem' }}
                            >
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Meta Info */}
                    <div className="d-flex flex-column flex-sm-row gap-2 align-items-start">
                      {/* Created/Updated date */}
                      <small className="text-muted d-flex align-items-center">
                        <i className="bi bi-clock me-1"></i>
                        Cập nhật: {formatDate(note.updatedAt)}
                      </small>
                      
                      {/* Creator info */}
                      {note.author && (
                        <small className="text-muted d-flex align-items-center">
                          <i className="bi bi-person-circle me-1"></i>
                          Tạo bởi: {note.author.name || note.author.email}
                        </small>
                      )}
                      
                      {/* File attachments */}
                      {note.attachments && note.attachments.length > 0 && (
                        <small className="text-muted d-flex align-items-center">
                          <i className="bi bi-paperclip me-1"></i>
                          {note.attachments.length} file đính kèm
                        </small>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Content - Actions */}
                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    {/* Actions Dropdown */}
                    {showActions && (
                      <div className="dropdown">
                        <button 
                          className="btn btn-sm btn-outline-secondary border-0 p-2" 
                          type="button" 
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{ minWidth: '32px', minHeight: '32px' }}
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                          <li>
                            <button 
                              className="dropdown-item py-2" 
                              type="button"
                              onClick={() => handleShareNote(note)}
                            >
                              <i className="bi bi-share me-2"></i>
                              Chia sẻ lại
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item py-2" 
                              type="button"
                              onClick={() => handleEditPermissions(note)}
                            >
                              <i className="bi bi-shield-lock me-2"></i>
                              Quyền truy cập
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item py-2" type="button">
                              <i className="bi bi-eye me-2"></i>
                              Xem chi tiết
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Workspace permissions info */}
            {note.workspacePermissions && (
              <div className="mt-2 p-2 bg-light rounded">
                <small className="text-muted">
                  <i className="bi bi-shield me-1"></i>
                  Quyền trong workspace: 
                  {note.workspacePermissions.canView && ' Xem'}
                  {note.workspacePermissions.canEdit && ' • Chỉnh sửa'}
                  {note.workspacePermissions.canDelete && ' • Xóa'}
                </small>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-3">
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={loadWorkspaceNotes}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Làm mới
        </button>
      </div>

      {/* Modals */}
      {selectedNote && (
        <>
          <ShareToWorkspaceModal
            show={showShareModal}
            onHide={() => setShowShareModal(false)}
            itemType="note"
            itemId={selectedNote.id}
            itemTitle={selectedNote.title}
            onShared={handleNoteUpdated}
          />

          <PermissionsModal
            show={showPermissionsModal}
            onHide={() => setShowPermissionsModal(false)}
            itemType="note"
            itemId={selectedNote.id}
            itemTitle={selectedNote.title}
            workspaceId={workspaceId}
            onPermissionsUpdated={handleNoteUpdated}
          />
        </>
      )}
    </div>
  );
};

export default WorkspaceNoteList;
