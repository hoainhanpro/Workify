package com.workify.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.workify.backend.model.Note;

@Repository
public interface NoteRepository extends MongoRepository<Note, String> {

       // Tìm note theo authorId
       List<Note> findByAuthorId(String authorId);

       // Tìm note theo authorId và sắp xếp theo thời gian tạo (mới nhất trước)
       List<Note> findByAuthorIdOrderByCreatedAtDesc(String authorId);

       // Tìm note theo title chứa keyword
       List<Note> findByAuthorIdAndTitleContainingIgnoreCase(String authorId, String keyword);

       // Đếm số lượng note của user
       long countByAuthorId(String authorId);

       // GĐ5: Tìm note được pin của user
       List<Note> findByAuthorIdAndIsPinnedTrueOrderByCreatedAtDesc(String authorId);

       // GĐ6: Tìm note theo tagId
       List<Note> findByAuthorIdAndTagIdsContainingOrderByCreatedAtDesc(String authorId, String tagId);

       // GĐ6: Tìm note theo nhiều tagIds
       List<Note> findByAuthorIdAndTagIdsInOrderByCreatedAtDesc(String authorId, List<String> tagIds);

       // GĐ6: Tìm kiếm note theo keyword trong title hoặc content
       List<Note> findByAuthorIdAndTitleContainingIgnoreCaseOrAuthorIdAndContentContainingIgnoreCaseOrderByCreatedAtDesc(
                     String authorId1, String titleKeyword, String authorId2, String contentKeyword);

       // GĐ6: Tìm kiếm note theo nhiều điều kiện (title, content, tags)
       List<Note> findByAuthorIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(String authorId, String keyword);

       // ============= WORKSPACE RELATED QUERIES =============

       /**
        * Tìm tất cả personal notes của user (không thuộc workspace nào)
        */
       @Query("{ 'authorId': ?0, $or: [ { 'workspaceId': null }, { 'workspaceId': '' } ] }")
       List<Note> findPersonalNotesByAuthorId(String authorId);

       /**
        * Tìm tất cả notes trong workspace
        */
       List<Note> findByWorkspaceId(String workspaceId);

       /**
        * Tìm notes trong workspace mà user có thể view
        * (author hoặc có trong shared permissions)
        */
       @Query("{ 'workspaceId': ?0, $or: [ " +
                     "{ 'authorId': ?1 }, " +
                     "{ 'sharedPermissions.canView': ?1 }, " +
                     "{ 'sharedPermissions.canEdit': ?1 } " +
                     "] }")
       List<Note> findWorkspaceNotesVisibleToUser(String workspaceId, String userId);

       /**
        * Tìm notes mà user tạo trong workspace
        */
       List<Note> findByWorkspaceIdAndAuthorId(String workspaceId, String authorId);

       /**
        * Tìm shared notes trong workspace
        */
       List<Note> findByWorkspaceIdAndIsSharedToWorkspaceTrue(String workspaceId);

       /**
        * Đếm số notes trong workspace
        */
       long countByWorkspaceId(String workspaceId);

       /**
        * Tìm note theo ID và kiểm tra user có quyền truy cập không
        */
       @Query("{ '_id': ?0, $or: [ " +
                     "{ 'authorId': ?1 }, " +
                     "{ 'sharedPermissions.canView': ?1 }, " +
                     "{ 'sharedPermissions.canEdit': ?1 } " +
                     "] }")
       Optional<Note> findByIdAndUserHasAccess(String noteId, String userId);

       /**
        * Tìm notes theo workspace và tag
        */
       List<Note> findByWorkspaceIdAndTagIdsContaining(String workspaceId, String tagId);

       /**
        * Search notes trong workspace theo keyword
        */
       @Query("{ 'workspaceId': ?0, $or: [ " +
                     "{ 'title': { $regex: ?1, $options: 'i' } }, " +
                     "{ 'content': { $regex: ?1, $options: 'i' } } " +
                     "], $or: [ " +
                     "{ 'authorId': ?2 }, " +
                     "{ 'sharedPermissions.canView': ?2 }, " +
                     "{ 'sharedPermissions.canEdit': ?2 } " +
                     "] }")
       List<Note> searchNotesInWorkspace(String workspaceId, String keyword, String userId);
}
