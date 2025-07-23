package com.workify.backend.controller;

import com.workify.backend.dto.InvitationRequest;
import com.workify.backend.dto.InvitationResponse;
import com.workify.backend.model.User;
import com.workify.backend.model.WorkspaceInvitation;
import com.workify.backend.model.WorkspaceRole;
import com.workify.backend.security.SecurityUtils;
import com.workify.backend.service.UserService;
import com.workify.backend.service.WorkspaceService;
import com.workify.backend.service.WorkspaceInvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller cho Workspace Invitation management
 */
@RestController
@RequestMapping("/api/workspaces")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasRole('USER')")
public class WorkspaceInvitationController {

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private UserService userService;

    @Autowired
    private WorkspaceInvitationService invitationService;

    /**
     * Gửi lời mời tham gia workspace
     */
    @PostMapping("/{workspaceId}/invitations")
    public ResponseEntity<Map<String, Object>> sendInvitation(
            @PathVariable String workspaceId,
            @Valid @RequestBody InvitationRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualInviterId = getCurrentActualUserId();

            WorkspaceRole role = request.getRole();

            WorkspaceInvitation invitation = workspaceService.sendInvitation(
                    workspaceId,
                    request.getInvitedEmail(),
                    request.getInvitedUsername(),
                    role,
                    actualInviterId);

            InvitationResponse invitationResponse = new InvitationResponse(invitation);

            response.put("success", true);
            response.put("message", "Invitation sent successfully");
            response.put("data", invitationResponse);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send invitation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy danh sách lời mời của workspace
     */
    @GetMapping("/{workspaceId}/invitations")
    public ResponseEntity<Map<String, Object>> getWorkspaceInvitations(@PathVariable String workspaceId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            List<WorkspaceInvitation> invitations = workspaceService.getWorkspaceInvitations(workspaceId, actualUserId);
            List<InvitationResponse> invitationResponses = invitations.stream()
                    .map(InvitationResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", invitationResponses);
            response.put("count", invitationResponses.size());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve invitations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy danh sách lời mời của user hiện tại
     */
    @GetMapping("/invitations/my")
    public ResponseEntity<Map<String, Object>> getMyInvitations() {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            // Sử dụng invitationService để lấy pending invitations (bao gồm cả
            // email/username)
            List<WorkspaceInvitation> invitations = invitationService.getPendingInvitationsForUser(actualUserId);
            List<InvitationResponse> invitationResponses = invitations.stream()
                    .map(InvitationResponse::new)
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", invitationResponses);
            response.put("count", invitationResponses.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve invitations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Chấp nhận lời mời
     */
    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<Map<String, Object>> acceptInvitation(@PathVariable String invitationId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            workspaceService.acceptInvitation(invitationId, actualUserId);

            response.put("success", true);
            response.put("message", "Invitation accepted successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to accept invitation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Từ chối lời mời
     */
    @PostMapping("/invitations/{invitationId}/decline")
    public ResponseEntity<Map<String, Object>> declineInvitation(@PathVariable String invitationId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            workspaceService.declineInvitation(invitationId, actualUserId);

            response.put("success", true);
            response.put("message", "Invitation declined successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to decline invitation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Hủy lời mời (dành cho admin/owner)
     */
    @DeleteMapping("/invitations/{invitationId}")
    public ResponseEntity<Map<String, Object>> cancelInvitation(@PathVariable String invitationId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            workspaceService.cancelInvitation(invitationId, actualUserId);

            response.put("success", true);
            response.put("message", "Invitation cancelled successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to cancel invitation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Gửi lại lời mời (resend)
     */
    @PostMapping("/invitations/{invitationId}/resend")
    public ResponseEntity<Map<String, Object>> resendInvitation(@PathVariable String invitationId) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            WorkspaceInvitation invitation = workspaceService.resendInvitation(invitationId, actualUserId);
            InvitationResponse invitationResponse = new InvitationResponse(invitation);

            response.put("success", true);
            response.put("message", "Invitation resent successfully");
            response.put("data", invitationResponse);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to resend invitation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thông tin lời mời theo token (public endpoint for email links)
     */
    @GetMapping("/invitations/token/{token}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getInvitationByToken(@PathVariable String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            WorkspaceInvitation invitation = workspaceService.getInvitationByToken(token);
            InvitationResponse invitationResponse = new InvitationResponse(invitation);

            response.put("success", true);
            response.put("data", invitationResponse);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve invitation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Chấp nhận lời mời bằng token (public endpoint for email links)
     */
    @PostMapping("/invitations/token/{token}/accept")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> acceptInvitationByToken(@PathVariable String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            String actualUserId = getCurrentActualUserId();

            workspaceService.acceptInvitationByToken(token, actualUserId);

            response.put("success", true);
            response.put("message", "Invitation accepted successfully");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (SecurityException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to accept invitation: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Helper method để lấy user ID thật từ SecurityContext
     */
    private String getCurrentActualUserId() {
        String username = SecurityUtils.getCurrentUserId(); // This returns username
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return userOpt.get().getId(); // Return actual MongoDB _id
    }
}
