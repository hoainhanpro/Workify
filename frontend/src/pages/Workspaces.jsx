import React, { useState, useEffect } from 'react';
import workspaceService from '../services/workspaceService';
import workspaceInvitationService from '../services/workspaceInvitationService';
import WorkspaceStatsCard from '../components/WorkspaceStatsCard';
import WorkspaceTaskList from '../components/WorkspaceTaskList';
import WorkspaceNoteList from '../components/WorkspaceNoteList';

const Workspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  
  // Workspace detail view states
  const [selectedWorkspaceForDetail, setSelectedWorkspaceForDetail] = useState(null);
  const [showWorkspaceDetail, setShowWorkspaceDetail] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });
  const [inviteForm, setInviteForm] = useState({
    emailOrUsername: '',
    role: 'VIEWER'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading workspaces...');
      // Chỉ load workspaces, không load pending invitations nữa
      const workspacesData = await workspaceService.getAllWorkspaces();
      console.log('✅ Workspaces loaded:', workspacesData);
      setWorkspaces(workspacesData);
      setPendingInvitations([]); // Set empty array
    } catch (error) {
      console.error('❌ Error loading workspaces:', error);
      setError('Không thể tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      await workspaceService.createWorkspace(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '' });
      loadData();
    } catch (error) {
      setError('Không thể tạo workspace: ' + error.message);
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa workspace này?')) {
      try {
        await workspaceService.deleteWorkspace(workspaceId);
        loadData();
      } catch (error) {
        setError('Không thể xóa workspace: ' + error.message);
      }
    }
  };

  const handleLeaveWorkspace = async (workspaceId) => {
    if (window.confirm('Bạn có chắc chắn muốn rời khỏi workspace này?')) {
      try {
        await workspaceService.leaveWorkspace(workspaceId);
        loadData();
      } catch (error) {
        setError('Không thể rời workspace: ' + error.message);
      }
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await workspaceInvitationService.acceptInvitation(invitationId);
      loadData();
    } catch (error) {
      setError('Không thể chấp nhận lời mời: ' + error.message);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await workspaceInvitationService.declineInvitation(invitationId);
      loadData();
    } catch (error) {
      setError('Không thể từ chối lời mời: ' + error.message);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    try {
      await workspaceInvitationService.sendInvitation(selectedWorkspace.id, inviteForm);
      setShowInviteModal(false);
      setInviteForm({ emailOrUsername: '', role: 'VIEWER' });
      setSelectedWorkspace(null);
    } catch (error) {
      setError('Không thể gửi lời mời: ' + error.message);
    }
  };

  const handleShowMembers = async (workspace) => {
    try {
      const members = await workspaceService.getWorkspaceMembers(workspace.id);
      setWorkspaceMembers(members);
      setSelectedWorkspace(workspace);
    } catch (error) {
      setError('Không thể tải danh sách thành viên: ' + error.message);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        await workspaceService.removeMember(selectedWorkspace.id, memberId);
        handleShowMembers(selectedWorkspace); // Reload members
      } catch (error) {
        setError('Không thể xóa thành viên: ' + error.message);
      }
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      await workspaceService.updateMemberRole(selectedWorkspace.id, memberId, newRole);
      handleShowMembers(selectedWorkspace); // Reload members
    } catch (error) {
      setError('Không thể cập nhật quyền: ' + error.message);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'OWNER': return 'danger';
      case 'ADMIN': return 'warning';
      case 'EDITOR': return 'info';
      case 'VIEWER': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleViewWorkspaceDetail = (workspace) => {
    setSelectedWorkspaceForDetail(workspace);
    setShowWorkspaceDetail(true);
  };

  const handleBackToWorkspaceList = () => {
    setShowWorkspaceDetail(false);
    setSelectedWorkspaceForDetail(null);
  };

  if (loading) {
    console.log('🔄 Workspaces component is loading...');
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering Workspaces component:', { 
    workspaces: workspaces.length, 
    pendingInvitations: pendingInvitations.length,
    error: !!error 
  });

  return (
    <div className="container-fluid">
      {showWorkspaceDetail && selectedWorkspaceForDetail ? (
        // Workspace Detail View
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <button 
                  className="btn btn-outline-secondary me-3"
                  onClick={handleBackToWorkspaceList}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Quay lại
                </button>
                <h2 className="d-inline">
                  <i className="bi bi-building me-2"></i>
                  {selectedWorkspaceForDetail.name}
                </h2>
              </div>
            </div>

            {selectedWorkspaceForDetail.description && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                {selectedWorkspaceForDetail.description}
              </div>
            )}

            {/* Workspace Stats */}
            <div className="row mb-4">
              <div className="col-12">
                <WorkspaceStatsCard 
                  workspaceId={selectedWorkspaceForDetail.id}
                  workspaceName={selectedWorkspaceForDetail.name}
                />
              </div>
            </div>

            {/* Tasks and Notes */}
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="bi bi-list-task me-2"></i>
                      Tasks trong Workspace
                    </h5>
                  </div>
                  <div className="card-body">
                    <WorkspaceTaskList 
                      workspaceId={selectedWorkspaceForDetail.id}
                      showActions={true}
                      limit={10}
                    />
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="bi bi-journal-text me-2"></i>
                      Notes trong Workspace
                    </h5>
                  </div>
                  <div className="card-body">
                    <WorkspaceNoteList 
                      workspaceId={selectedWorkspaceForDetail.id}
                      showActions={true}
                      limit={10}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Workspace List View
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Quản lý Nhóm</h2>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowCreateModal(true)}
              >
                <i className="bi bi-plus"></i> Tạo Nhóm
              </button>
            </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError('')}
              ></button>
            </div>
          )}

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Lời Mời Đang Chờ</h5>
              </div>
              <div className="card-body">
                {pendingInvitations.map(invitation => (
                  <div key={invitation.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div>
                      <strong>{invitation.workspaceName}</strong>
                      <br />
                      <small className="text-muted">
                        Từ: {invitation.inviterName} - Quyền: {invitation.role}
                      </small>
                    </div>
                    <div>
                      <button 
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        Chấp nhận
                      </button>
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workspaces Grid */}
          <div className="row">
            {Array.isArray(workspaces) && workspaces.map(workspace => {
              // Defensive check cho workspace object
              if (!workspace || !workspace.id) {
                console.warn('⚠️ Invalid workspace object:', workspace);
                return null;
              }
              
              return (
                <div key={workspace.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title">{workspace.name || 'Unnamed Group'}</h5>
                        <span className={`badge bg-${getRoleColor(workspace.userRole || 'VIEWER')}`}>
                          {workspace.userRole || 'VIEWER'}
                        </span>
                      </div>
                      <p className="card-text">{workspace.description || 'No description'}</p>
                      <div className="text-muted small mb-3">
                        <i className="bi bi-people"></i> {workspace.memberCount || 0} thành viên
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="btn-group w-100" role="group">
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleViewWorkspaceDetail(workspace)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Xem chi tiết
                        </button>
                        <button 
                          className="btn btn-outline-info btn-sm"
                          onClick={() => handleShowMembers(workspace)}
                          data-bs-toggle="modal" 
                          data-bs-target="#membersModal"
                        >
                          Thành viên
                        </button>
                        {(workspace.userRole === 'OWNER' || workspace.userRole === 'ADMIN') && (
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setSelectedWorkspace(workspace);
                              setShowInviteModal(true);
                            }}
                            data-bs-toggle="modal" 
                            data-bs-target="#inviteModal"
                          >
                            Mời
                          </button>
                        )}
                        {workspace.userRole === 'OWNER' ? (
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                          >
                            Xóa
                          </button>
                        ) : (
                          <button 
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => handleLeaveWorkspace(workspace.id)}
                          >
                            Rời
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {workspaces.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-folder2-open display-1 text-muted"></i>
              <h4 className="mt-3">Chưa có workspace nào</h4>
              <p className="text-muted">Tạo workspace đầu tiên để bắt đầu cộng tác</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo Nhóm Mới</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateWorkspace}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="workspaceName" className="form-label">Tên Nhóm</label>
                    <input
                      type="text"
                      className="form-control"
                      id="workspaceName"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="workspaceDescription" className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      id="workspaceDescription"
                      rows="3"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Tạo Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mời Thành Viên</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSendInvitation}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="emailOrUsername" className="form-label">Email hoặc Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="emailOrUsername"
                      value={inviteForm.emailOrUsername}
                      onChange={(e) => setInviteForm({...inviteForm, emailOrUsername: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Quyền</label>
                    <select
                      className="form-control"
                      id="role"
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    >
                      <option value="VIEWER">Viewer - Chỉ xem</option>
                      <option value="EDITOR">Editor - Chỉnh sửa</option>
                      <option value="ADMIN">Admin - Quản lý</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Gửi Lời Mời
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      <div className="modal fade" id="membersModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Thành viên - {selectedWorkspace?.name}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên đầy đủ</th>
                      <th>Username</th>
                      <th>Quyền</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspaceMembers.map(member => (
                      <tr key={member.userId}>
                        <td>{member.fullName}</td>
                        <td>{member.username}</td>
                        <td>
                          {(selectedWorkspace?.userRole === 'OWNER' && member.role !== 'OWNER') ? (
                            <select 
                              className="form-select form-select-sm"
                              value={member.role}
                              onChange={(e) => handleUpdateMemberRole(member.userId, e.target.value)}
                            >
                              <option value="VIEWER">Viewer</option>
                              <option value="EDITOR">Editor</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          ) : (
                            <span className={`badge bg-${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${member.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'}`}>
                            {member.status}
                          </span>
                        </td>
                        <td>
                          {(selectedWorkspace?.userRole === 'OWNER' || selectedWorkspace?.userRole === 'ADMIN') 
                            && member.role !== 'OWNER' && (
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleRemoveMember(member.userId)}
                            >
                              Xóa
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspaces;
