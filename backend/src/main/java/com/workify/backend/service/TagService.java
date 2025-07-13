package com.workify.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.workify.backend.dto.TagCreateRequest;
import com.workify.backend.dto.TagResponse;
import com.workify.backend.dto.TagUpdateRequest;
import com.workify.backend.model.Tag;
import com.workify.backend.repository.TagRepository;

/**
 * Tag Service - Xử lý logic nghiệp vụ cho Tag
 */
@Service
public class TagService {
    
    @Autowired
    private TagRepository tagRepository;
    
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
}
