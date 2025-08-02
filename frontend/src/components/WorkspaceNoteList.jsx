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

      const workspaceNotes = await noteService.getWorkspaceNotesDetailed(workspaceId);
      
      // Apply limit if specified
      const limitedNotes = limit ? workspaceNotes.slice(0, limit) : workspaceNotes;
      setNotes(limitedNotes);
    } catch (error) {
      console.error('Error loading workspace notes:', error);
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

  const truncateHTML = (html, maxLength = 150) => {
    if (!html) return '';
    
    // Remove HTML tags for preview
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getPermissionsBadge = (permissions) => {
    if (!permissions) return null;
    
    const permissionLabels = [];
    if (permissions.read) permissionLabels.push('Read');
    if (permissions.write) permissionLabels.push('Write');  
    if (permissions.delete) permissionLabels.push('Delete');
    
    return permissionLabels.map((label, index) => (
      <span 
        key={label} 
        className={`badge me-1 ${label === 'Delete' ? 'bg-danger' : label === 'Write' ? 'bg-warning' : 'bg-info'}`}
      >
        {label}
      </span>
    ));
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
        <i className="bi bi-journal-x fs-1 text-muted"></i>
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

      <div className="row">
        {notes.map((note) => (
          <div key={note.id} className="col-md-6 col-lg-4 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="card-title mb-0" title={note.title}>
                    {note.title.length > 50 ? note.title.substring(0, 50) + '...' : note.title}
                  </h6>
                  {showActions && (
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
                            onClick={() => handleShareNote(note)}
                          >
                            <i className="bi bi-share me-2"></i>
                            Chia sẻ lại
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => handleEditPermissions(note)}
                          >
                            <i className="bi bi-shield-lock me-2"></i>
                            Quyền truy cập
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {note.content && (
                  <p className="card-text text-muted small">
                    {truncateHTML(note.content)}
                  </p>
                )}

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="mb-2">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="badge bg-secondary me-1">
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="badge bg-light text-dark">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Permissions */}
                {note.workspacePermissions && (
                  <div className="mb-2">
                    <small className="text-muted">Quyền: </small>
                    {getPermissionsBadge(note.workspacePermissions)}
                  </div>
                )}

                <div className="small text-muted">
                  <div className="mb-1">
                    <i className="bi bi-clock me-1"></i>
                    Cập nhật: {formatDate(note.updatedAt)}
                  </div>

                  <div className="mb-1">
                    <i className="bi bi-person-circle me-1"></i>
                    Tạo bởi: {note.creator?.name || note.creator?.email}
                  </div>

                  {note.files && note.files.length > 0 && (
                    <div className="mb-1">
                      <i className="bi bi-paperclip me-1"></i>
                      {note.files.length} file đính kèm
                    </div>
                  )}

                  {note.version && (
                    <div className="mb-1">
                      <i className="bi bi-arrow-repeat me-1"></i>
                      Version: {note.version}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with quick actions */}
              <div className="card-footer bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-calendar3 me-1"></i>
                    {formatDate(note.createdAt)}
                  </small>
                  
                  {note.isPublic && (
                    <span className="badge bg-success">
                      <i className="bi bi-globe me-1"></i>
                      Public
                    </span>
                  )}
                </div>
              </div>
            </div>
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
