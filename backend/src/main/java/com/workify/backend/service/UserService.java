package com.workify.backend.service;

import com.workify.backend.dto.RegisterRequest;
import com.workify.backend.dto.UserResponse;
import com.workify.backend.model.User;
import com.workify.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register new user
    public UserResponse registerUser(RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username already exists: " + registerRequest.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists: " + registerRequest.getEmail());
        }

        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        user.setRole("USER");
        user.setEnabled(true);

        // Save user
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }

    // Get user by ID
    public Optional<UserResponse> getUserById(String id) {
        return userRepository.findById(id)
                .map(UserResponse::new);
    }

    // Get user by username
    public Optional<UserResponse> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(UserResponse::new);
    }

    // Get user by email
    public Optional<UserResponse> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserResponse::new);
    }

    // Get all users
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    // Get users by role
    public List<UserResponse> getUsersByRole(String role) {
        return userRepository.findByRole(role)
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    // Update user enabled status
    public UserResponse updateUserStatus(String id, boolean enabled) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setEnabled(enabled);
            User savedUser = userRepository.save(user);
            return new UserResponse(savedUser);
        }
        throw new RuntimeException("User not found with id: " + id);
    }

    // Update user role
    public UserResponse updateUserRole(String id, String role) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setRole(role);
            User savedUser = userRepository.save(user);
            return new UserResponse(savedUser);
        }
        throw new RuntimeException("User not found with id: " + id);
    }

    // Delete user
    public boolean deleteUser(String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Check if user exists by username or email
    public boolean existsByUsernameOrEmail(String username, String email) {
        return userRepository.existsByUsername(username) || userRepository.existsByEmail(email);
    }

    // Get user statistics
    public UserStats getUserStats() {
        long totalUsers = userRepository.count();
        long enabledUsers = userRepository.countByEnabled(true);
        long disabledUsers = userRepository.countByEnabled(false);
        long adminUsers = userRepository.countByRole("ADMIN");
        long regularUsers = userRepository.countByRole("USER");
        
        return new UserStats(totalUsers, enabledUsers, disabledUsers, adminUsers, regularUsers);
    }

    // Inner class for user statistics
    public static class UserStats {
        private long totalUsers;
        private long enabledUsers;
        private long disabledUsers;
        private long adminUsers;
        private long regularUsers;

        public UserStats(long totalUsers, long enabledUsers, long disabledUsers, long adminUsers, long regularUsers) {
            this.totalUsers = totalUsers;
            this.enabledUsers = enabledUsers;
            this.disabledUsers = disabledUsers;
            this.adminUsers = adminUsers;
            this.regularUsers = regularUsers;
        }

        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getEnabledUsers() { return enabledUsers; }
        public long getDisabledUsers() { return disabledUsers; }
        public long getAdminUsers() { return adminUsers; }
        public long getRegularUsers() { return regularUsers; }
    }
} 