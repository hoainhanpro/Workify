package com.workify.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workify.backend.dto.GoogleCallbackRequest;
import com.workify.backend.dto.GoogleOAuthResponse;
import com.workify.backend.service.GoogleOAuthService;
import com.workify.backend.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/oauth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OAuthController {

    @Autowired
    private GoogleOAuthService googleOAuthService;

    @Autowired
    private JwtService jwtService;

    /**
     * Test endpoint to verify OAuth configuration
     */
    @GetMapping("/config/test")
    public ResponseEntity<Map<String, Object>> testOAuthConfig() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test OAuth properties are loaded correctly
            response.put("success", true);
            response.put("message", "OAuth configuration loaded successfully");
            response.put("data", Map.of(
                "hasClientId", googleOAuthService.getClientId() != null && !googleOAuthService.getClientId().isEmpty(),
                "hasClientSecret", googleOAuthService.getClientSecret() != null && !googleOAuthService.getClientSecret().isEmpty(),
                "redirectUri", googleOAuthService.getRedirectUri()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "OAuth configuration error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Xử lý Google OAuth callback
     * Frontend gửi authorization code sau khi user authorize trên Google
     */
    @PostMapping("/google/callback")
    public ResponseEntity<Map<String, Object>> handleGoogleCallback(@Valid @RequestBody GoogleCallbackRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            GoogleOAuthResponse oauthResponse = googleOAuthService.handleGoogleCallback(request);
            
            response.put("success", true);
            response.put("message", "Google authentication successful");
            response.put("data", oauthResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Internal server error during Google authentication");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Endpoint để frontend lấy Google OAuth URL
     */
    @PostMapping("/google/url")
    public ResponseEntity<Map<String, Object>> getGoogleOAuthUrl() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Construct Google OAuth URL
            String googleOAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=YOUR_GOOGLE_CLIENT_ID" +
                "&redirect_uri=http://localhost:3000/auth/google/callback" +
                "&response_type=code" +
                "&scope=openid email profile" +
                "&access_type=offline" +
                "&prompt=consent" +
                "&state=security_token_here";
            
            response.put("success", true);
            response.put("data", Map.of("url", googleOAuthUrl));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to generate Google OAuth URL");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Link Google account to existing user (requires authentication)
     */
    @PostMapping("/google/link")
    public ResponseEntity<Map<String, Object>> linkGoogleAccount(
            @Valid @RequestBody GoogleCallbackRequest request,
            HttpServletRequest httpRequest) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy userId từ JWT token trong header Authorization
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("success", false);
                response.put("message", "No authorization token provided");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String token = authHeader.substring(7);
            String userId = extractUserIdFromToken(token);
            
            if (userId == null) {
                response.put("success", false);
                response.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            GoogleOAuthResponse oauthResponse = googleOAuthService.linkGoogleAccount(request, userId);
            
            response.put("success", true);
            response.put("message", "Google account linked successfully");
            response.put("data", oauthResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Internal server error during Google account linking");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Unlink Google account from user
     */
    @DeleteMapping("/google/unlink")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> unlinkGoogleAccount(HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            googleOAuthService.unlinkGoogleAccount(userId);
            
            response.put("success", true);
            response.put("message", "Google account unlinked successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Internal server error during Google account unlinking");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get linked OAuth accounts for current user
     */
    @GetMapping("/linked-accounts")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getLinkedAccounts(HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            Map<String, Object> linkedAccounts = googleOAuthService.getLinkedAccounts(userId);
            
            response.put("success", true);
            response.put("data", linkedAccounts);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting linked accounts: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Refresh Google access token
     */
    @PostMapping("/google/refresh")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> refreshGoogleToken(HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) httpRequest.getAttribute("userId");
            if (userId == null) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String googleAccessToken = googleOAuthService.refreshGoogleAccessToken(userId);
            
            response.put("success", true);
            response.put("data", Map.of("googleAccessToken", googleAccessToken));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error refreshing Google token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Extract userId from JWT token
     */
    private String extractUserIdFromToken(String token) {
        try {
            if (jwtService.isTokenValid(token)) {
                return jwtService.extractUserId(token);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
