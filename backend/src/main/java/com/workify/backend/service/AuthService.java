package com.workify.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.workify.backend.config.JwtProperties;
import com.workify.backend.dto.AuthResponse;
import com.workify.backend.dto.LoginRequest;
import com.workify.backend.dto.RefreshTokenRequest;
import com.workify.backend.dto.UserResponse;

@Service
public class AuthService {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JwtProperties jwtProperties;

    /**
     * Authenticate user và tạo JWT tokens
     */
    public AuthResponse login(LoginRequest loginRequest) {
        try {
            // Authenticate user
            Optional<UserResponse> userResponseOpt = userService.authenticateUser(
                loginRequest.getUsernameOrEmail(), 
                loginRequest.getPassword()
            );

            if (userResponseOpt.isPresent()) {
                UserResponse user = userResponseOpt.get();

                // Generate JWT tokens
                String accessToken = jwtService.generateToken(
                    user.getUsername(), 
                    user.getId(), 
                    user.getRole()
                );

                String refreshToken = jwtService.generateRefreshToken(
                    user.getUsername(), 
                    user.getId()
                );

                // Return authentication response
                return new AuthResponse(
                    accessToken, 
                    refreshToken, 
                    jwtProperties.getExpiration(), 
                    user
                );
            } else {
                throw new RuntimeException("Authentication failed");
            }
        } catch (Exception e) {
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    /**
     * Refresh access token
     */
    public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        try {
            String refreshToken = refreshTokenRequest.getRefreshToken();
            
            // Validate refresh token
            if (!jwtService.isTokenValid(refreshToken)) {
                throw new RuntimeException("Invalid refresh token");
            }

            // Extract info from refresh token
            String username = jwtService.extractUsername(refreshToken);
            String userId = jwtService.extractUserId(refreshToken);
            String tokenType = jwtService.extractTokenType(refreshToken);

            if (!"refresh".equals(tokenType)) {
                throw new RuntimeException("Token is not a refresh token");
            }

            // Get user info
            Optional<UserResponse> userResponseOpt = userService.getUserByUsername(username);
            
            if (userResponseOpt.isPresent()) {
                UserResponse user = userResponseOpt.get();

                // Generate new access token
                String newAccessToken = jwtService.generateToken(
                    user.getUsername(), 
                    user.getId(), 
                    user.getRole()
                );

                // Generate new refresh token
                String newRefreshToken = jwtService.generateRefreshToken(
                    user.getUsername(), 
                    user.getId()
                );

                // Revoke old refresh token
                jwtService.revokeToken(refreshToken, userId, "Token refresh");

                return new AuthResponse(
                    newAccessToken, 
                    newRefreshToken, 
                    jwtProperties.getExpiration(), 
                    user
                );
            } else {
                throw new RuntimeException("User not found");
            }
        } catch (Exception e) {
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    /**
     * Logout user (revoke token)
     */
    public void logout(String accessToken, String userId) {
        try {
            // Revoke access token
            jwtService.revokeToken(accessToken, userId, "User logout");
        } catch (Exception e) {
            throw new RuntimeException("Logout failed: " + e.getMessage());
        }
    }

    /**
     * Logout user from all devices (revoke all tokens)
     */
    public void logoutFromAllDevices(String userId) {
        try {
            // Revoke all tokens for user
            jwtService.revokeAllTokensForUser(userId, "Logout from all devices");
        } catch (Exception e) {
            throw new RuntimeException("Logout from all devices failed: " + e.getMessage());
        }
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        try {
            return jwtService.isTokenValid(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get user info from token
     */
    public Optional<UserResponse> getUserFromToken(String token) {
        try {
            if (jwtService.isTokenValid(token)) {
                String username = jwtService.extractUsername(token);
                return userService.getUserByUsername(username);
            }
            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
