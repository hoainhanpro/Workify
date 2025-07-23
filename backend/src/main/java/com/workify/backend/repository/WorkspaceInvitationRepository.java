package com.workify.backend.repository;

import com.workify.backend.model.InvitationStatus;
import com.workify.backend.model.WorkspaceInvitation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface cho WorkspaceInvitation
 */
@Repository
public interface WorkspaceInvitationRepository extends MongoRepository<WorkspaceInvitation, String> {

       /**
        * Tìm invitation theo token
        */
       Optional<WorkspaceInvitation> findByToken(String token);

       /**
        * Tìm tất cả invitation của workspace
        */
       List<WorkspaceInvitation> findByWorkspaceId(String workspaceId);

       /**
        * Tìm invitation theo workspace và status
        */
       List<WorkspaceInvitation> findByWorkspaceIdAndStatus(String workspaceId, InvitationStatus status);

       /**
        * Tìm invitation theo workspace và invited user ID
        */
       Optional<WorkspaceInvitation> findByWorkspaceIdAndInvitedUserId(String workspaceId, String invitedUserId);

       /**
        * Tìm danh sách invitation của workspace ordered by created date
        */
       List<WorkspaceInvitation> findByWorkspaceIdOrderByCreatedAtDesc(String workspaceId);

       /**
        * Tìm danh sách invitation của user theo status ordered by created date
        */
       List<WorkspaceInvitation> findByInvitedUserIdAndStatusOrderByCreatedAtDesc(String invitedUserId,
                     InvitationStatus status);

       /**
        * Tìm invitation gửi bởi user
        */
       List<WorkspaceInvitation> findByInviterUserId(String inviterUserId);

       /**
        * Tìm invitation nhận bởi email
        */
       List<WorkspaceInvitation> findByInvitedEmail(String invitedEmail);

       /**
        * Tìm invitation nhận bởi username
        */
       List<WorkspaceInvitation> findByInvitedUsername(String invitedUsername);

       /**
        * Tìm invitation nhận bởi user ID
        */
       List<WorkspaceInvitation> findByInvitedUserId(String invitedUserId);

       /**
        * Kiểm tra xem đã có invitation pending cho user và workspace này chưa
        */
       @Query("{ 'workspaceId': ?0, " +
                     "$or: [ " +
                     "{ 'invitedEmail': ?1 }, " +
                     "{ 'invitedUsername': ?2 }, " +
                     "{ 'invitedUserId': ?3 } " +
                     "], " +
                     "'status': 'PENDING' }")
       Optional<WorkspaceInvitation> findPendingInvitation(String workspaceId, String email, String username,
                     String userId);

       /**
        * Tìm tất cả invitation hết hạn
        */
       @Query("{ 'expiresAt': { $lt: ?0 }, 'status': 'PENDING' }")
       List<WorkspaceInvitation> findExpiredInvitations(LocalDateTime now);

       /**
        * Tìm invitation pending của user
        */
       @Query("{ $or: [ " +
                     "{ 'invitedEmail': ?0 }, " +
                     "{ 'invitedUsername': ?1 }, " +
                     "{ 'invitedUserId': ?2 } " +
                     "], " +
                     "'status': 'PENDING', " +
                     "'expiresAt': { $gt: ?3 } }")
       List<WorkspaceInvitation> findPendingInvitationsForUser(String email, String username, String userId,
                     LocalDateTime now);

       /**
        * Xóa tất cả invitation của workspace
        */
       void deleteByWorkspaceId(String workspaceId);

       /**
        * Đếm số lượng invitation pending của workspace
        */
       long countByWorkspaceIdAndStatus(String workspaceId, InvitationStatus status);
}
