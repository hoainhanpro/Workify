package com.workify.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;

/**
 * GĐ7: Model cho file đính kèm trong note
 * Hỗ trợ upload file local với giới hạn tổng dung lượng < 5MB per note
 */
public class Attachment {
    
    private String fileName;     // Tên file gốc
    private String fileUrl;      // Đường dẫn file local (không phải Google Drive)
    private String fileType;     // Loại file (pdf, docx, jpg, etc.)
    private Long size;           // Kích thước file (bytes)
    
    @CreatedDate
    private LocalDateTime uploadedAt;
    
    // Constructors
    public Attachment() {}
    
    public Attachment(String fileName, String fileUrl, String fileType, Long size) {
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.size = size;
    }
    
    // Getters and Setters
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getFileUrl() {
        return fileUrl;
    }
    
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    
    public String getFileType() {
        return fileType;
    }
    
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
    
    public Long getSize() {
        return size;
    }
    
    public void setSize(Long size) {
        this.size = size;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
    
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
    
    @Override
    public String toString() {
        return "Attachment{" +
                "fileName='" + fileName + '\'' +
                ", fileUrl='" + fileUrl + '\'' +
                ", fileType='" + fileType + '\'' +
                ", size=" + size +
                ", uploadedAt=" + uploadedAt +
                '}';
    }
}
