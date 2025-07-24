package com.workify.backend.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Recording Model - Quản lý ghi âm cuộc họp và AI transcription
 */
@Document(collection = "recordings")
public class Recording {
    
    @Id
    private String id;
    
    @NotBlank(message = "User ID cannot be blank")
    private String userId; // Reference đến User (người ghi âm)
    
    @NotBlank(message = "Title cannot be blank")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title; // Tiêu đề cuộc họp
    
    @NotNull(message = "Recording date cannot be null")
    private LocalDateTime recordingDate; // Ngày giờ ghi âm
    
    // File âm thanh
    @NotBlank(message = "Audio file URL cannot be blank")
    private String audioFileUrl; // URL file âm thanh
    
    @NotBlank(message = "Audio file name cannot be blank")
    private String audioFileName; // Tên file gốc
    
    private Long audioFileSize; // Kích thước file (bytes)
    
    private String storageType = "LOCAL"; // "LOCAL" hoặc "DRIVE" (dựa vào >5MB)
    
    // AI Processing
    private String transcriptionText; // Văn bản chuyển đổi từ audio
    
    private String summaryText; // Nội dung tóm tắt
    
    private String processingStatus = "PENDING"; // "PENDING" | "COMPLETED" | "FAILED"
    
    // Metadata
    private Double durationSeconds; // Thời lượng (giây) - chính xác hơn cho seek bar
    
    private String language = "vi"; // Ngôn ngữ ("vi" | "en")
    
    private List<String> tagIds; // Array tag IDs (reference đến Tag collection)
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Constructors
    public Recording() {}
    
    public Recording(String userId, String title, LocalDateTime recordingDate, 
                    String audioFileUrl, String audioFileName) {
        this.userId = userId;
        this.title = title;
        this.recordingDate = recordingDate;
        this.audioFileUrl = audioFileUrl;
        this.audioFileName = audioFileName;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public LocalDateTime getRecordingDate() {
        return recordingDate;
    }
    
    public void setRecordingDate(LocalDateTime recordingDate) {
        this.recordingDate = recordingDate;
    }
    
    public String getAudioFileUrl() {
        return audioFileUrl;
    }
    
    public void setAudioFileUrl(String audioFileUrl) {
        this.audioFileUrl = audioFileUrl;
    }
    
    public String getAudioFileName() {
        return audioFileName;
    }
    
    public void setAudioFileName(String audioFileName) {
        this.audioFileName = audioFileName;
    }
    
    public Long getAudioFileSize() {
        return audioFileSize;
    }
    
    public void setAudioFileSize(Long audioFileSize) {
        this.audioFileSize = audioFileSize;
    }
    
    public String getStorageType() {
        return storageType;
    }
    
    public void setStorageType(String storageType) {
        this.storageType = storageType;
    }
    
    public String getTranscriptionText() {
        return transcriptionText;
    }
    
    public void setTranscriptionText(String transcriptionText) {
        this.transcriptionText = transcriptionText;
    }
    
    public String getSummaryText() {
        return summaryText;
    }
    
    public void setSummaryText(String summaryText) {
        this.summaryText = summaryText;
    }
    
    public String getProcessingStatus() {
        return processingStatus;
    }
    
    public void setProcessingStatus(String processingStatus) {
        this.processingStatus = processingStatus;
    }
    
    public Double getDurationSeconds() {
        return durationSeconds;
    }
    
    public void setDurationSeconds(Double durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public List<String> getTagIds() {
        return tagIds;
    }
    
    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "Recording{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", title='" + title + '\'' +
                ", recordingDate=" + recordingDate +
                ", audioFileUrl='" + audioFileUrl + '\'' +
                ", audioFileName='" + audioFileName + '\'' +
                ", audioFileSize=" + audioFileSize +
                ", storageType='" + storageType + '\'' +
                ", processingStatus='" + processingStatus + '\'' +
                ", durationSeconds=" + durationSeconds +
                ", language='" + language + '\'' +
                ", tagIds=" + tagIds +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
