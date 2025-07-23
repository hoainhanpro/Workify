package com.workify.backend.repository;

import com.workify.backend.model.Workspace;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface cho Workspace
 */
@Repository
public interface WorkspaceRepository extends MongoRepository<Workspace, String> {

    /**
     * Tìm tất cả workspace mà user là owner
     */
    List<Workspace> findByOwnerId(String ownerId);

    /**
     * Tìm tất cả workspace mà user là member (bao gồm cả owner)
     */
    @Query("{ 'members.userId': ?0, 'members.status': 'ACTIVE' }")
    List<Workspace> findByMembersUserIdAndMembersStatus(String userId);

    /**
     * Tìm workspace theo tên và owner
     */
    Optional<Workspace> findByNameAndOwnerId(String name, String ownerId);

    /**
     * Kiểm tra user có phải là member của workspace không
     */
    @Query("{ '_id': ?0, 'members.userId': ?1, 'members.status': 'ACTIVE' }")
    Optional<Workspace> findByIdAndMembersUserIdAndMembersStatus(String workspaceId, String userId);

    /**
     * Tìm tất cả workspace có chứa tên
     */
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Workspace> findByNameContainingIgnoreCase(String name);

    /**
     * Đếm số lượng workspace của user
     */
    long countByOwnerId(String ownerId);

    /**
     * Tìm workspace theo ID và kiểm tra user có quyền admin không
     */
    @Query("{ '_id': ?0, $or: [ " +
            "{ 'ownerId': ?1 }, " +
            "{ 'members': { $elemMatch: { 'userId': ?1, 'role': { $in: ['OWNER', 'ADMIN'] }, 'status': 'ACTIVE' } } } "
            +
            "] }")
    Optional<Workspace> findByIdAndUserHasAdminRole(String workspaceId, String userId);
}
