package com.workify.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workify.backend.dto.AuthResponse;
import com.workify.backend.dto.LoginRequest;
import com.workify.backend.dto.RefreshTokenRequest;
import com.workify.backend.dto.RegisterRequest;
import com.workify.backend.dto.UserResponse;
import com.workify.backend.security.SecurityUtils;
import com.workify.backend.service.AuthService;
import com.workify.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    /**
     * Register new user
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            UserResponse userResponse = userService.registerUser(registerRequest);
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("data", userResponse);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    /**
     * Login user
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            AuthResponse authResponse = authService.login(loginRequest);
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("data", authResponse);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getCurrentUserProfile(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Lấy username từ SecurityContext
            Optional<String> currentUsername = SecurityUtils.getCurrentUsername();
            
            if (currentUsername.isPresent()) {
                Optional<UserResponse> userResponse = userService.getUserByUsername(currentUsername.get());
                
                if (userResponse.isPresent()) {
                    response.put("success", true);
                    response.put("data", userResponse.get());
                    
                    // Thêm thông tin từ request attributes (từ JWT filter)
                    String userId = (String) request.getAttribute("userId");
                    String role = (String) request.getAttribute("role");
                    
                    Map<String, Object> authInfo = new HashMap<>();
                    authInfo.put("userId", userId);
                    authInfo.put("username", currentUsername.get());
                    authInfo.put("role", role);
                    authInfo.put("isAuthenticated", SecurityUtils.isAuthenticated());
                    
                    response.put("auth", authInfo);
                    
                    return ResponseEntity.ok(response);
                }
            }
            
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting user profile: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Check authentication status
     */
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAuthStatus(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<String> currentUsername = SecurityUtils.getCurrentUsername();
            
            if (currentUsername.isPresent()) {
                String userId = (String) request.getAttribute("userId");
                String role = (String) request.getAttribute("role");
                
                Map<String, Object> authInfo = new HashMap<>();
                authInfo.put("userId", userId);
                authInfo.put("username", currentUsername.get());
                authInfo.put("role", role);
                authInfo.put("isAuthenticated", true);
                authInfo.put("hasAdminRole", SecurityUtils.hasRole("ADMIN"));
                authInfo.put("hasUserRole", SecurityUtils.hasRole("USER"));
                
                response.put("success", true);
                response.put("data", authInfo);
                
                return ResponseEntity.ok(response);
            }
            
            response.put("success", false);
            response.put("message", "Not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error checking auth status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Refresh access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            com.workify.backend.dto.AuthResponse authResponse = authService.refreshToken(refreshTokenRequest);
            
            response.put("success", true);
            response.put("message", "Token refreshed successfully");
            response.put("data", authResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Token refresh failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Logout user (revoke current token)
     */
    @PostMapping("/logout")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy token từ header
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String userId = (String) request.getAttribute("userId");
                
                // Revoke token
                authService.logout(token, userId);
                
                response.put("success", true);
                response.put("message", "Logout successful");
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "No token provided");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Logout failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Logout from all devices
     */
    @PostMapping("/logout-all")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> logoutFromAllDevices(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userId = (String) request.getAttribute("userId");
            
            if (userId != null) {
                // Revoke all tokens for user
                authService.logoutFromAllDevices(userId);
                
                response.put("success", true);
                response.put("message", "Logged out from all devices successfully");
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "User ID not found");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Logout from all devices failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
