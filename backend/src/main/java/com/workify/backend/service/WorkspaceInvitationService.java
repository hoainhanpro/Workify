package com.workify.backend.service;

import com.workify.backend.model.InvitationStatus;
import com.workify.backend.model.User;
import com.workify.backend.model.Workspace;
import com.workify.backend.model.WorkspaceInvitation;
import com.workify.backend.model.WorkspaceRole;
import com.workify.backend.repository.WorkspaceInvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class cho Workspace Invitation management
 */
@Service
public class WorkspaceInvitationService {

    @Autowired
    private WorkspaceInvitationRepository invitationRepository;

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private UserService userService;

    /**
     * Gửi lời mời tham gia workspace bằng email
     */
    public WorkspaceInvitation inviteByEmail(String workspaceId, String inviterUserId,
            String invitedEmail, WorkspaceRole role) {
        // Kiểm tra workspace tồn tại và user có quyền invite
        if (!workspaceService.hasAdminAccess(workspaceId, inviterUserId)) {
            throw new SecurityException("You don't have permission to invite members to this workspace");
        }

        // Kiểm tra email đã có invitation pending chưa
        Optional<WorkspaceInvitation> existingInvitation = invitationRepository.findPendingInvitation(workspaceId,
                invitedEmail, null, null);
        if (existingInvitation.isPresent()) {
            throw new IllegalArgumentException("There is already a pending invitation for this email");
        }

        // Kiểm tra user với email này đã là member chưa
        Optional<User> existingUser = userService.findByEmail(invitedEmail);
        if (existingUser.isPresent()) {
            if (workspaceService.hasWorkspaceAccess(workspaceId, existingUser.get().getId())) {
                throw new IllegalArgumentException("User with this email is already a member of the workspace");
            }
        }

        WorkspaceInvitation invitation = new WorkspaceInvitation(
                workspaceId, inviterUserId, invitedEmail, null, role);

        // Set invitedUserId nếu tìm thấy user
        if (existingUser.isPresent()) {
            invitation.setInvitedUserId(existingUser.get().getId());
        }

        return invitationRepository.save(invitation);
    }

    /**
     * Gửi lời mời tham gia workspace bằng username
     */
    public WorkspaceInvitation inviteByUsername(String workspaceId, String inviterUserId,
            String invitedUsername, WorkspaceRole role) {
        // Kiểm tra workspace tồn tại và user có quyền invite
        if (!workspaceService.hasAdminAccess(workspaceId, inviterUserId)) {
            throw new SecurityException("You don't have permission to invite members to this workspace");
        }

        // Tìm user theo username
        Optional<User> invitedUser = userService.findByUsername(invitedUsername);
        if (invitedUser.isEmpty()) {
            throw new IllegalArgumentException("User with username '" + invitedUsername + "' not found");
        }

        String invitedUserId = invitedUser.get().getId();

        // Kiểm tra user đã là member chưa
        if (workspaceService.hasWorkspaceAccess(workspaceId, invitedUserId)) {
            throw new IllegalArgumentException("User is already a member of the workspace");
        }

        // Kiểm tra đã có invitation pending chưa
        Optional<WorkspaceInvitation> existingInvitation = invitationRepository.findPendingInvitation(workspaceId, null,
                invitedUsername, invitedUserId);
        if (existingInvitation.isPresent()) {
            throw new IllegalArgumentException("There is already a pending invitation for this user");
        }

        WorkspaceInvitation invitation = new WorkspaceInvitation(
                workspaceId, inviterUserId, invitedUser.get().getEmail(), invitedUsername, role);
        invitation.setInvitedUserId(invitedUserId);

        return invitationRepository.save(invitation);
    }

    /**
     * Accept invitation
     */
    public Workspace acceptInvitation(String token, String userId) {
        Optional<WorkspaceInvitation> invitationOpt = invitationRepository.findByToken(token);
        if (invitationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invitation not found");
        }

        WorkspaceInvitation invitation = invitationOpt.get();

        // Kiểm tra invitation có hợp lệ không
        if (!invitation.isPending()) {
            throw new IllegalArgumentException("Invitation is no longer valid");
        }

        // Kiểm tra invitation có dành cho user này không
        boolean isForThisUser = false;
        if (invitation.getInvitedUserId() != null && invitation.getInvitedUserId().equals(userId)) {
            isForThisUser = true;
        } else {
            // Kiểm tra bằng email hoặc username
            Optional<User> user = userService.findById(userId);
            if (user.isPresent()) {
                User u = user.get();
                if ((invitation.getInvitedEmail() != null && invitation.getInvitedEmail().equals(u.getEmail())) ||
                        (invitation.getInvitedUsername() != null
                                && invitation.getInvitedUsername().equals(u.getUsername()))) {
                    isForThisUser = true;
                    // Cập nhật invitedUserId
                    invitation.setInvitedUserId(userId);
                }
            }
        }

        if (!isForThisUser) {
            throw new SecurityException("This invitation is not for you");
        }

        // Kiểm tra user đã là member chưa
        if (workspaceService.hasWorkspaceAccess(invitation.getWorkspaceId(), userId)) {
            throw new IllegalArgumentException("You are already a member of this workspace");
        }

        // Accept invitation
        invitation.accept();
        invitationRepository.save(invitation);

        // Thêm user vào workspace
        return workspaceService.addMember(invitation.getWorkspaceId(), userId,
                invitation.getRole(), invitation.getInviterUserId());
    }

    /**
     * Decline invitation
     */
    public void declineInvitation(String token, String userId) {
        Optional<WorkspaceInvitation> invitationOpt = invitationRepository.findByToken(token);
        if (invitationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invitation not found");
        }

        WorkspaceInvitation invitation = invitationOpt.get();

        // Kiểm tra invitation có hợp lệ không
        if (!invitation.isPending()) {
            throw new IllegalArgumentException("Invitation is no longer valid");
        }

        // Kiểm tra invitation có dành cho user này không
        boolean isForThisUser = false;
        if (invitation.getInvitedUserId() != null && invitation.getInvitedUserId().equals(userId)) {
            isForThisUser = true;
        } else {
            // Kiểm tra bằng email hoặc username
            Optional<User> user = userService.findById(userId);
            if (user.isPresent()) {
                User u = user.get();
                if ((invitation.getInvitedEmail() != null && invitation.getInvitedEmail().equals(u.getEmail())) ||
                        (invitation.getInvitedUsername() != null
                                && invitation.getInvitedUsername().equals(u.getUsername()))) {
                    isForThisUser = true;
                }
            }
        }

        if (!isForThisUser) {
            throw new SecurityException("This invitation is not for you");
        }

        // Decline invitation
        invitation.decline();
        invitationRepository.save(invitation);
    }

    /**
     * Lấy invitation theo token
     */
    public Optional<WorkspaceInvitation> getInvitationByToken(String token) {
        return invitationRepository.findByToken(token);
    }

    /**
     * Lấy tất cả invitations của workspace
     */
    public List<WorkspaceInvitation> getWorkspaceInvitations(String workspaceId, String userId) {
        // Kiểm tra user có quyền xem invitations không
        if (!workspaceService.hasAdminAccess(workspaceId, userId)) {
            throw new SecurityException("You don't have permission to view invitations");
        }

        return invitationRepository.findByWorkspaceId(workspaceId);
    }

    /**
     * Lấy pending invitations của user
     */
    public List<WorkspaceInvitation> getPendingInvitationsForUser(String userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userOpt.get();
        return invitationRepository.findPendingInvitationsForUser(
                user.getEmail(), user.getUsername(), userId, LocalDateTime.now());
    }

    /**
     * Hủy invitation (chỉ inviter hoặc admin workspace)
     */
    public void cancelInvitation(String invitationId, String userId) {
        Optional<WorkspaceInvitation> invitationOpt = invitationRepository.findById(invitationId);
        if (invitationOpt.isEmpty()) {
            throw new IllegalArgumentException("Invitation not found");
        }

        WorkspaceInvitation invitation = invitationOpt.get();

        // Kiểm tra quyền: inviter hoặc admin workspace
        boolean hasPermission = invitation.getInviterUserId().equals(userId) ||
                workspaceService.hasAdminAccess(invitation.getWorkspaceId(), userId);

        if (!hasPermission) {
            throw new SecurityException("You don't have permission to cancel this invitation");
        }

        invitationRepository.deleteById(invitationId);
    }

    /**
     * Xử lý expired invitations (có thể chạy theo schedule)
     */
    public void processExpiredInvitations() {
        List<WorkspaceInvitation> expiredInvitations = invitationRepository.findExpiredInvitations(LocalDateTime.now());

        for (WorkspaceInvitation invitation : expiredInvitations) {
            invitation.markAsExpired();
        }

        invitationRepository.saveAll(expiredInvitations);
    }

    /**
     * Đếm pending invitations của workspace
     */
    public long countPendingInvitations(String workspaceId) {
        return invitationRepository.countByWorkspaceIdAndStatus(workspaceId, InvitationStatus.PENDING);
    }
}
