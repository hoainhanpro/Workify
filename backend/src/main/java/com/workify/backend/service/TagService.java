package com.workify.backend.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.workify.backend.dto.TagCreateRequest;
import com.workify.backend.dto.TagResponse;
import com.workify.backend.dto.TagUpdateRequest;
import com.workify.backend.model.Note;
import com.workify.backend.model.Tag;
import com.workify.backend.model.Task;
import com.workify.backend.repository.NoteRepository;
import com.workify.backend.repository.TagRepository;
import com.workify.backend.repository.TaskRepository;

/**
 * Tag Service - Xử lý logic nghiệp vụ cho Tag
 */
@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private TaskRepository taskRepository;

    /**
     * Tạo tag mới
     */
    public TagResponse createTag(TagCreateRequest request, String authorId) {
        // Kiểm tra tag đã tồn tại chưa
        Optional<Tag> existingTag = tagRepository.findByNameAndAuthorId(request.getName(), authorId);
        if (existingTag.isPresent()) {
            throw new IllegalArgumentException("Tag với tên '" + request.getName() + "' đã tồn tại");
        }

        Tag tag = new Tag(request.getName(), request.getColor(), request.getDescription(), authorId);
        Tag savedTag = tagRepository.save(tag);
        return new TagResponse(savedTag);
    }

    /**
     * Lấy tất cả tags của user
     */
    public List<TagResponse> getAllTagsByUser(String authorId) {
        List<Tag> tags = tagRepository.findByAuthorIdOrderByNameAsc(authorId);
        return tags.stream()
                .map(TagResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tag theo ID
     */
    public Optional<TagResponse> getTagById(String tagId, String authorId) {
        Optional<Tag> tagOpt = tagRepository.findById(tagId);

        if (tagOpt.isEmpty() || !tagOpt.get().getAuthorId().equals(authorId)) {
            return Optional.empty();
        }

        return Optional.of(new TagResponse(tagOpt.get()));
    }

    /**
     * Cập nhật tag
     */
    public Optional<TagResponse> updateTag(String tagId, TagUpdateRequest request, String authorId) {
        Optional<Tag> tagOpt = tagRepository.findById(tagId);

        if (tagOpt.isEmpty() || !tagOpt.get().getAuthorId().equals(authorId)) {
            return Optional.empty();
        }

        Tag tag = tagOpt.get();

        // Kiểm tra tên tag mới có trùng không (nếu thay đổi tên)
        if (request.getName() != null && !request.getName().equals(tag.getName())) {
            Optional<Tag> existingTag = tagRepository.findByNameAndAuthorId(request.getName(), authorId);
            if (existingTag.isPresent()) {
                throw new IllegalArgumentException("Tag với tên '" + request.getName() + "' đã tồn tại");
            }
            tag.setName(request.getName());
        }

        // Cập nhật các trường khác
        if (request.getColor() != null) {
            tag.setColor(request.getColor());
        }

        if (request.getDescription() != null) {
            tag.setDescription(request.getDescription());
        }

        Tag updatedTag = tagRepository.save(tag);
        return Optional.of(new TagResponse(updatedTag));
    }

    /**
     * Xóa tag
     */
    public boolean deleteTag(String tagId, String authorId) {
        Optional<Tag> tagOpt = tagRepository.findById(tagId);

        if (tagOpt.isEmpty() || !tagOpt.get().getAuthorId().equals(authorId)) {
            return false;
        }

        tagRepository.deleteById(tagId);
        return true;
    }

    /**
     * Tìm kiếm tags theo tên
     */
    public List<TagResponse> searchTagsByName(String authorId, String searchTerm) {
        List<Tag> tags = tagRepository.findByAuthorIdAndNameContainingIgnoreCaseOrderByNameAsc(authorId, searchTerm);
        return tags.stream()
                .map(TagResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tags theo màu sắc
     */
    public List<TagResponse> getTagsByColor(String authorId, String color) {
        List<Tag> tags = tagRepository.findByAuthorIdAndColorOrderByNameAsc(authorId, color);
        return tags.stream()
                .map(TagResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số lượng tags của user
     */
    public long countTagsByUser(String authorId) {
        return tagRepository.countByAuthorId(authorId);
    }

    /**
     * Kiểm tra tag có tồn tại và thuộc về user không
     */
    public boolean isTagOwnedByUser(String tagId, String authorId) {
        Optional<Tag> tagOpt = tagRepository.findById(tagId);
        return tagOpt.isPresent() && tagOpt.get().getAuthorId().equals(authorId);
    }

    /**
     * Lấy thống kê chi tiết về việc sử dụng tags
     * Bao gồm: tổng số tags, tags được sử dụng, tags chưa sử dụng
     */
    public Map<String, Object> getDetailedTagStats(String authorId) {
        // Lấy tất cả tags của user
        List<Tag> allTags = tagRepository.findByAuthorIdOrderByNameAsc(authorId);
        long totalTags = allTags.size();

        // Lấy tất cả tagIds được sử dụng trong Notes
        List<Note> userNotes = noteRepository.findByAuthorId(authorId);
        Set<String> usedTagIdsInNotes = new HashSet<>();
        for (Note note : userNotes) {
            if (note.getTagIds() != null) {
                usedTagIdsInNotes.addAll(note.getTagIds());
            }
        }

        // Lấy tất cả tagIds được sử dụng trong Tasks
        List<Task> userTasks = taskRepository.findByUserId(authorId);
        Set<String> usedTagIdsInTasks = new HashSet<>();
        for (Task task : userTasks) {
            if (task.getTags() != null) {
                usedTagIdsInTasks.addAll(task.getTags());
            }
        }

        // Tổng hợp tất cả tagIds được sử dụng
        Set<String> allUsedTagIds = new HashSet<>();
        allUsedTagIds.addAll(usedTagIdsInNotes);
        allUsedTagIds.addAll(usedTagIdsInTasks);

        // Lọc ra những tagIds thực sự tồn tại và thuộc về user
        Set<String> validUsedTagIds = new HashSet<>();
        for (String tagId : allUsedTagIds) {
            if (isTagOwnedByUser(tagId, authorId)) {
                validUsedTagIds.add(tagId);
            }
        }

        // Tính toán thống kê
        long usedTags = validUsedTagIds.size();
        long unusedTags = totalTags - usedTags;

        // Tạo response
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTags", totalTags);
        stats.put("usedTags", usedTags);
        stats.put("unusedTags", unusedTags);
        stats.put("usedInNotes", usedTagIdsInNotes.size());
        stats.put("usedInTasks", usedTagIdsInTasks.size());

        return stats;
    }
}
