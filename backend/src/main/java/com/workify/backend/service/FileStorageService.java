package com.workify.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.workify.backend.model.Attachment;

/**
 * GĐ7: Service xử lý upload file local
 * Giới hạn: Tổng dung lượng file trong 1 note < 5MB
 */
@Service
public class FileStorageService {
    
    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;
    
    // Hằng số GĐ7
    private static final long MAX_TOTAL_SIZE_PER_NOTE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_EXTENSIONS = {
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
        "txt", "rtf", "jpg", "jpeg", "png", "gif", "bmp"
    };
    
    /**
     * Kiểm tra tổng dung lượng file hiện tại của note
     */
    public void validateTotalFileSize(long currentTotalSize, long newFileSize) {
        if (currentTotalSize + newFileSize > MAX_TOTAL_SIZE_PER_NOTE) {
            throw new IllegalArgumentException(
                String.format("Tổng dung lượng file vượt quá giới hạn %dMB. " +
                "Hiện tại: %.2fMB, File mới: %.2fMB", 
                MAX_TOTAL_SIZE_PER_NOTE / (1024 * 1024),
                currentTotalSize / (1024.0 * 1024.0),
                newFileSize / (1024.0 * 1024.0))
            );
        }
    }
    
    /**
     * Kiểm tra loại file được phép
     */
    public void validateFileType(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        
        boolean isAllowed = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equals(extension)) {
                isAllowed = true;
                break;
            }
        }
        
        if (!isAllowed) {
            throw new IllegalArgumentException("Loại file '" + extension + "' không được hỗ trợ");
        }
    }
    
    /**
     * Upload file và trả về Attachment object
     */
    public Attachment uploadFile(MultipartFile file, String authorId) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }
        
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên file không hợp lệ");
        }
        
        validateFileType(originalFileName);
        
        // Tạo tên file unique
        String uniqueFileName = generateUniqueFileName(originalFileName, authorId);
        
        // Tạo đường dẫn lưu file
        Path uploadPath = createUploadPath(authorId);
        Path filePath = uploadPath.resolve(uniqueFileName);
        
        // Copy file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Tạo Attachment object
        Attachment attachment = new Attachment();
        attachment.setFileName(originalFileName);
        attachment.setFileUrl(filePath.toString()); // Đường dẫn local
        attachment.setFileType(getFileExtension(originalFileName));
        attachment.setSize(file.getSize());
        attachment.setUploadedAt(LocalDateTime.now());
        
        return attachment;
    }
    
    /**
     * Xóa file khỏi storage
     */
    public void deleteFile(String fileUrl) {
        try {
            Path filePath = Paths.get(fileUrl);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error nhưng không throw exception để không ảnh hưởng tới DB operations
            System.err.println("Không thể xóa file: " + fileUrl + " - " + e.getMessage());
        }
    }
    
    /**
     * Lấy extension của file
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
    
    /**
     * Tạo tên file unique
     */
    private String generateUniqueFileName(String originalFileName, String authorId) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(originalFileName);
        
        return String.format("%s_%s_%s.%s", authorId, timestamp, uuid, extension);
    }
    
    /**
     * Tạo thư mục upload nếu chưa tồn tại
     */
    private Path createUploadPath(String authorId) throws IOException {
        Path uploadPath = Paths.get(uploadDir, "notes", authorId);
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        return uploadPath;
    }
    
    /**
     * Tính tổng dung lượng của danh sách attachments
     */
    public long calculateTotalSize(java.util.List<Attachment> attachments) {
        return attachments.stream()
                .mapToLong(Attachment::getSize)
                .sum();
    }
    
    /**
     * GĐ7+: Đọc nội dung file để serve cho client
     */
    public byte[] readFileContent(String fileUrl) throws IOException {
        Path filePath = Paths.get(fileUrl);
        
        if (!Files.exists(filePath)) {
            throw new IOException("File không tồn tại: " + fileUrl);
        }
        
        return Files.readAllBytes(filePath);
    }
    
    /**
     * GĐ7+: Lấy content type của file
     */
    public String getContentType(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "bmp":
                return "image/bmp";
            case "pdf":
                return "application/pdf";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls":
                return "application/vnd.ms-excel";
            case "xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt":
                return "application/vnd.ms-powerpoint";
            case "pptx":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "txt":
                return "text/plain";
            case "rtf":
                return "application/rtf";
            default:
                return "application/octet-stream";
        }
    }
}
