package com.workify.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workify.backend.dto.UserResponse;
import com.workify.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    @Autowired
    private UserService userService;

    // Get all users (Admin only)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", users);
        response.put("count", users.size());
        return ResponseEntity.ok(response);
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String id) {
        Optional<UserResponse> user = userService.getUserById(id);
        Map<String, Object> response = new HashMap<>();
        if (user.isPresent()) {
            response.put("success", true);
            response.put("data", user.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Get user by username
    @GetMapping("/username/{username}")
    public ResponseEntity<Map<String, Object>> getUserByUsername(@PathVariable String username) {
        Optional<UserResponse> user = userService.getUserByUsername(username);
        Map<String, Object> response = new HashMap<>();
        if (user.isPresent()) {
            response.put("success", true);
            response.put("data", user.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Get users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<Map<String, Object>> getUsersByRole(@PathVariable String role) {
        List<UserResponse> users = userService.getUsersByRole(role);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", users);
        response.put("count", users.size());
        return ResponseEntity.ok(response);
    }

    // Update user status (enable/disable)
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateUserStatus(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> statusRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean enabled = statusRequest.get("enabled");
            UserResponse updatedUser = userService.updateUserStatus(id, enabled);
            response.put("success", true);
            response.put("message", "User status updated successfully");
            response.put("data", updatedUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Update user role
    @PutMapping("/{id}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> roleRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String role = roleRequest.get("role");
            UserResponse updatedUser = userService.updateUserRole(id, role);
            response.put("success", true);
            response.put("message", "User role updated successfully");
            response.put("data", updatedUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String id) {
        boolean deleted = userService.deleteUser(id);
        Map<String, Object> response = new HashMap<>();
        if (deleted) {
            response.put("success", true);
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Get user statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        UserService.UserStats stats = userService.getUserStats();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", stats);
        return ResponseEntity.ok(response);
    }

    // Check if username or email exists
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> checkUserExists(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Boolean> exists = new HashMap<>();
        
        if (username != null) {
            exists.put("username", userService.getUserByUsername(username).isPresent());
        }
        
        if (email != null) {
            exists.put("email", userService.getUserByEmail(email).isPresent());
        }
        
        response.put("success", true);
        response.put("data", exists);
        return ResponseEntity.ok(response);
    }
}