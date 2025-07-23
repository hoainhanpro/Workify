package com.workify.backend.service;

import com.workify.backend.model.User;
import com.workify.backend.model.Workspace;
import com.workify.backend.model.WorkspaceInvitation;
import com.workify.backend.model.WorkspaceMember;
import com.workify.backend.model.WorkspaceRole;
import com.workify.backend.model.InvitationStatus;
import com.workify.backend.repository.WorkspaceRepository;
import com.workify.backend.repository.WorkspaceInvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class cho Workspace management
 */
@Service
public class WorkspaceService {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceInvitationRepository invitationRepository;

    @Autowired
    private UserService userService;

    /**
     * Tạo workspace mới
     */
    public Workspace createWorkspace(String name, String description, String ownerId) {
        // Kiểm tra user tồn tại
        if (!userService.existsById(ownerId)) {
            throw new IllegalArgumentException("User not found");
        }

        // Kiểm tra tên workspace đã tồn tại cho user này chưa
        Optional<Workspace> existing = workspaceRepository.findByNameAndOwnerId(name, ownerId);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Workspace with this name already exists");
        }

        Workspace workspace = new Workspace(name, description, ownerId);
        return workspaceRepository.save(workspace);
    }

    /**
     * Lấy tất cả workspace của user (as member)
     */
    public List<Workspace> getWorkspacesByUserId(String userId) {
        return workspaceRepository.findByMembersUserIdAndMembersStatus(userId);
    }

    /**
     * Lấy tất cả workspace mà user là owner
     */
    public List<Workspace> getWorkspacesByOwnerId(String ownerId) {
        return workspaceRepository.findByOwnerId(ownerId);
    }

    /**
     * Lấy workspace theo ID
     */
    public Optional<Workspace> getWorkspaceById(String id) {
        return workspaceRepository.findById(id);
    }

    /**
     * Lấy workspace theo ID và kiểm tra user có quyền truy cập
     */
    public Optional<Workspace> getWorkspaceByIdAndUserId(String workspaceId, String userId) {
        return workspaceRepository.findByIdAndMembersUserIdAndMembersStatus(workspaceId, userId);
    }

    /**
     * Update workspace (chỉ owner hoặc admin)
     */
    public Workspace updateWorkspace(String workspaceId, String name, String description, String userId) {
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found");
        }

        Workspace workspace = workspaceOpt.get();

        // Kiểm tra quyền (owner hoặc admin)
        if (!workspace.hasAdminRole(userId)) {
            throw new SecurityException("You don't have permission to update this workspace");
        }

        workspace.setName(name);
        workspace.setDescription(description);

        return workspaceRepository.save(workspace);
    }

    /**
     * Xóa workspace (chỉ owner)
     */
    public void deleteWorkspace(String workspaceId, String userId) {
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found");
        }

        Workspace workspace = workspaceOpt.get();

        // Chỉ owner mới có thể xóa workspace
        if (!workspace.isOwner(userId)) {
            throw new SecurityException("Only workspace owner can delete workspace");
        }

        workspaceRepository.deleteById(workspaceId);
    }

    /**
     * Thêm member vào workspace
     */
    public Workspace addMember(String workspaceId, String userId, WorkspaceRole role, String requestUserId) {
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found");
        }

        Workspace workspace = workspaceOpt.get();

        // Kiểm tra quyền (owner hoặc admin)
        if (!workspace.hasAdminRole(requestUserId)) {
            throw new SecurityException("You don't have permission to add members");
        }

        // Kiểm tra user tồn tại
        if (!userService.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        // Kiểm tra user đã là member chưa
        if (workspace.isMember(userId)) {
            throw new IllegalArgumentException("User is already a member of this workspace");
        }

        // Không thể thêm OWNER role
        if (role == WorkspaceRole.OWNER) {
            throw new IllegalArgumentException("Cannot assign OWNER role. There can only be one owner.");
        }

        workspace.addMember(userId, role);
        return workspaceRepository.save(workspace);
    }

    /**
     * Xóa member khỏi workspace
     */
    public Workspace removeMember(String workspaceId, String userId, String requestUserId) {
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found");
        }

        Workspace workspace = workspaceOpt.get();

        // Không thể xóa owner
        if (workspace.isOwner(userId)) {
            throw new IllegalArgumentException("Cannot remove workspace owner");
        }

        // Kiểm tra quyền: owner, admin, hoặc chính user đó muốn rời workspace
        boolean hasPermission = workspace.hasAdminRole(requestUserId) || userId.equals(requestUserId);
        if (!hasPermission) {
            throw new SecurityException("You don't have permission to remove this member");
        }

        workspace.removeMember(userId);
        return workspaceRepository.save(workspace);
    }

    /**
     * Cập nhật role của member
     */
    public Workspace updateMemberRole(String workspaceId, String userId, WorkspaceRole newRole, String requestUserId) {
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found");
        }

        Workspace workspace = workspaceOpt.get();

        // Kiểm tra quyền (owner hoặc admin)
        if (!workspace.hasAdminRole(requestUserId)) {
            throw new SecurityException("You don't have permission to update member roles");
        }

        // Không thể thay đổi role của owner
        if (workspace.isOwner(userId)) {
            throw new IllegalArgumentException("Cannot change owner's role");
        }

        // Không thể assign OWNER role
        if (newRole == WorkspaceRole.OWNER) {
            throw new IllegalArgumentException("Cannot assign OWNER role. There can only be one owner.");
        }

        workspace.updateMemberRole(userId, newRole);
        return workspaceRepository.save(workspace);
    }

    /**
     * Lấy danh sách members của workspace
     */
    public List<WorkspaceMember> getWorkspaceMembers(String workspaceId, String userId) {
        Optional<Workspace> workspaceOpt = getWorkspaceByIdAndUserId(workspaceId, userId);
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found or you don't have access");
        }

        return workspaceOpt.get().getActiveMembers();
    }

    /**
     * Kiểm tra user có quyền truy cập workspace không
     */
    public boolean hasWorkspaceAccess(String workspaceId, String userId) {
        return getWorkspaceByIdAndUserId(workspaceId, userId).isPresent();
    }

    /**
     * Kiểm tra user có quyền admin trong workspace không
     */
    public boolean hasAdminAccess(String workspaceId, String userId) {
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        return workspaceOpt.isPresent() && workspaceOpt.get().hasAdminRole(userId);
    }

    /**
     * Kiểm tra user có quyền edit trong workspace không
     */
    public boolean hasEditAccess(String workspaceId, String userId) {
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        return workspaceOpt.isPresent() && workspaceOpt.get().canUserEdit(userId);
    }

    /**
     * Search workspace theo tên
     */
    public List<Workspace> searchWorkspacesByName(String name) {
        return workspaceRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Đếm số workspace của owner
     */
    public long countWorkspacesByOwnerId(String ownerId) {
        return workspaceRepository.countByOwnerId(ownerId);
    }

    // ========== INVITATION METHODS ==========

    /**
     * Gửi lời mời tham gia workspace
     */
    public WorkspaceInvitation sendInvitation(String workspaceId, String invitedEmail, String invitedUsername,
            WorkspaceRole role, String inviterId) {
        // Kiểm tra workspace tồn tại và quyền admin
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found");
        }

        Workspace workspace = workspaceOpt.get();
        if (!workspace.hasAdminRole(inviterId)) {
            throw new SecurityException("Only admins can send invitations");
        }

        // Tìm user được mời
        User invitedUser = null;
        if (invitedEmail != null && !invitedEmail.trim().isEmpty()) {
            Optional<User> userOpt = userService.findByEmail(invitedEmail);
            if (userOpt.isPresent()) {
                invitedUser = userOpt.get();
            }
        } else if (invitedUsername != null && !invitedUsername.trim().isEmpty()) {
            Optional<User> userOpt = userService.findByUsername(invitedUsername);
            if (userOpt.isPresent()) {
                invitedUser = userOpt.get();
            }
        } else {
            throw new IllegalArgumentException("Either email or username must be provided");
        }

        if (invitedUser == null) {
            throw new IllegalArgumentException("User not found");
        }

        // Kiểm tra user đã là member chưa
        if (workspace.isMember(invitedUser.getId())) {
            throw new IllegalArgumentException("User is already a member of this workspace");
        }

        // Kiểm tra đã có invitation pending chưa
        Optional<WorkspaceInvitation> existingInvitation = invitationRepository
                .findByWorkspaceIdAndInvitedUserId(workspaceId, invitedUser.getId());
        if (existingInvitation.isPresent() && existingInvitation.get().getStatus() == InvitationStatus.PENDING) {
            throw new IllegalArgumentException("User already has a pending invitation to this workspace");
        }

        // Tạo invitation mới
        WorkspaceInvitation invitation = new WorkspaceInvitation();
        invitation.setWorkspaceId(workspaceId);
        invitation.setInvitedUserId(invitedUser.getId());
        invitation.setInvitedEmail(invitedUser.getEmail());
        invitation.setInvitedUsername(invitedUser.getUsername());
        invitation.setInviterUserId(inviterId);
        invitation.setRole(role);
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setCreatedAt(LocalDateTime.now());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7)); // Hết hạn sau 7 ngày
        invitation.setToken(invitation.generateToken());

        return invitationRepository.save(invitation);
    }

    /**
     * Lấy danh sách lời mời của workspace
     */
    public List<WorkspaceInvitation> getWorkspaceInvitations(String workspaceId, String requestUserId) {
        // Kiểm tra quyền truy cập
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found");
        }

        Workspace workspace = workspaceOpt.get();
        if (!workspace.isMember(requestUserId)) {
            throw new SecurityException("You don't have access to this workspace");
        }

        return invitationRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
    }

    /**
     * Lấy danh sách lời mời của user
     */
    public List<WorkspaceInvitation> getUserInvitations(String userId) {
        return invitationRepository.findByInvitedUserIdAndStatusOrderByCreatedAtDesc(userId, InvitationStatus.PENDING);
    }

    /**
     * Chấp nhận lời mời
     */
    public void acceptInvitation(String invitationId, String userId) {
        Optional<WorkspaceInvitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invitation not found");
        }

        WorkspaceInvitation invitation = invitationOpt.get();

        // Kiểm tra quyền
        if (!invitation.getInvitedUserId().equals(userId)) {
            throw new SecurityException("You can only accept your own invitations");
        }

        // Kiểm tra trạng thái và hạn
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }

        if (invitation.isExpired()) {
            throw new IllegalArgumentException("Invitation has expired");
        }

        // Chấp nhận invitation
        invitation.accept();
        invitationRepository.save(invitation);

        // Thêm user vào workspace
        addMember(invitation.getWorkspaceId(), userId, invitation.getRole(), invitation.getInviterUserId());
    }

    /**
     * Từ chối lời mời
     */
    public void declineInvitation(String invitationId, String userId) {
        Optional<WorkspaceInvitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invitation not found");
        }

        WorkspaceInvitation invitation = invitationOpt.get();

        // Kiểm tra quyền
        if (!invitation.getInvitedUserId().equals(userId)) {
            throw new SecurityException("You can only decline your own invitations");
        }

        // Kiểm tra trạng thái
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is not pending");
        }

        // Từ chối invitation
        invitation.decline();
        invitationRepository.save(invitation);
    }

    /**
     * Hủy lời mời (admin/owner)
     */
    public void cancelInvitation(String invitationId, String requestUserId) {
        Optional<WorkspaceInvitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invitation not found");
        }

        WorkspaceInvitation invitation = invitationOpt.get();

        // Kiểm tra quyền admin
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(invitation.getWorkspaceId());
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found");
        }

        Workspace workspace = workspaceOpt.get();
        if (!workspace.hasAdminRole(requestUserId) && !invitation.getInviterUserId().equals(requestUserId)) {
            throw new SecurityException("Only admins or the inviter can cancel invitations");
        }

        // Xóa invitation
        invitationRepository.delete(invitation);
    }

    /**
     * Gửi lại lời mời
     */
    public WorkspaceInvitation resendInvitation(String invitationId, String requestUserId) {
        Optional<WorkspaceInvitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invitation not found");
        }

        WorkspaceInvitation invitation = invitationOpt.get();

        // Kiểm tra quyền admin
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(invitation.getWorkspaceId());
        if (workspaceOpt.isEmpty()) {
            throw new IllegalArgumentException("Workspace not found");
        }

        Workspace workspace = workspaceOpt.get();
        if (!workspace.hasAdminRole(requestUserId)) {
            throw new SecurityException("Only admins can resend invitations");
        }

        // Reset invitation
        invitation.setCreatedAt(LocalDateTime.now());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
        invitation.setToken(invitation.generateToken());
        invitation.setStatus(InvitationStatus.PENDING);

        return invitationRepository.save(invitation);
    }

    /**
     * Lấy invitation theo token
     */
    public WorkspaceInvitation getInvitationByToken(String token) {
        Optional<WorkspaceInvitation> invitationOpt = invitationRepository.findByToken(token);
        if (invitationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid invitation token");
        }

        WorkspaceInvitation invitation = invitationOpt.get();
        if (invitation.isExpired()) {
            throw new IllegalArgumentException("Invitation has expired");
        }

        return invitation;
    }

    /**
     * Chấp nhận invitation bằng token
     */
    public void acceptInvitationByToken(String token, String userId) {
        WorkspaceInvitation invitation = getInvitationByToken(token);

        // Kiểm tra user ID khớp
        if (!invitation.getInvitedUserId().equals(userId)) {
            throw new SecurityException("This invitation is not for you");
        }

        acceptInvitation(invitation.getId(), userId);
    }
}
