package com.workify.backend.repository;

import com.workify.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // Find user by username
    Optional<User> findByUsername(String username);

    // Find user by email
    Optional<User> findByEmail(String email);

    // Find user by username or email
    @Query("{'$or': [{'username': ?0}, {'email': ?0}]}")
    Optional<User> findByUsernameOrEmail(String usernameOrEmail);

    // Check if username exists
    boolean existsByUsername(String username);

    // Check if email exists
    boolean existsByEmail(String email);

    // Find users by role
    List<User> findByRole(String role);

    // Find enabled users
    List<User> findByEnabled(boolean enabled);

    // Find users by role and enabled status
    List<User> findByRoleAndEnabled(String role, boolean enabled);

    // Count users by role
    long countByRole(String role);

    // Count enabled users
    long countByEnabled(boolean enabled);

    // Find all users ordered by creation date descending
    List<User> findAllByOrderByCreatedAtDesc();
} 