package com.workify.backend.service;

import com.workify.backend.model.Recording;
import com.workify.backend.repository.RecordingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.jaudiotagger.audio.AudioFile;
import org.jaudiotagger.audio.AudioFileIO;
import org.jaudiotagger.audio.AudioHeader;
import org.jaudiotagger.audio.exceptions.CannotReadException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecordingService {

    private static final Logger logger = LoggerFactory.getLogger(RecordingService.class);

    @Autowired
    private RecordingRepository recordingRepository;

    @Value("${app.recording.upload-dir:recordings}")
    private String uploadDir;

    // Giới hạn dung lượng file âm thanh (50MB)
    private static final long MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    // Các định dạng audio được hỗ trợ
    private static final String[] ALLOWED_AUDIO_EXTENSIONS = {
        "mp3", "wav", "m4a", "aac", "ogg", "flac", "wma", "webm"
    };

    /**
     * Khởi tạo thư mục upload nếu chưa tồn tại
     */
    private void initUploadDirectory() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize recording storage directory", e);
        }
    }

    /**
     * Kiểm tra định dạng file âm thanh
     */
    private void validateAudioFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        if (file.getSize() > MAX_AUDIO_FILE_SIZE) {
            throw new IllegalArgumentException(
                String.format("File quá lớn. Kích thước tối đa: %dMB", 
                MAX_AUDIO_FILE_SIZE / (1024 * 1024))
            );
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("Tên file không hợp lệ");
        }

        String extension = getFileExtension(originalFilename);
        boolean isValidExtension = false;
        for (String allowedExt : ALLOWED_AUDIO_EXTENSIONS) {
            if (allowedExt.equalsIgnoreCase(extension)) {
                isValidExtension = true;
                break;
            }
        }

        if (!isValidExtension) {
            throw new IllegalArgumentException(
                "Định dạng file không được hỗ trợ. Các định dạng hỗ trợ: " + 
                String.join(", ", ALLOWED_AUDIO_EXTENSIONS)
            );
        }
    }

    /**
     * Lấy phần mở rộng của file
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    /**
     * Trích xuất thời lượng của file âm thanh
     */
    private Double getAudioDuration(File audioFile) {
        logger.info("Attempting to extract audio duration from file: {}", audioFile.getName());
        try {
            AudioFile f = AudioFileIO.read(audioFile);
            AudioHeader header = f.getAudioHeader();
            if (header != null) {
                double duration = (double) header.getTrackLength();
                logger.info("Successfully extracted duration: {} seconds", duration);
                return duration;
            } else {
                logger.warn("Audio header was null for file: {}", audioFile.getName());
                return 0.0;
            }
        } catch (CannotReadException e) {
            // This can happen for formats not supported by the library, like webm
            logger.warn("Cannot read audio file (possibly unsupported format like webm): {}. Defaulting duration to 0.", audioFile.getName());
            return 0.0;
        } catch (Exception e) {
            logger.error("Could not read audio duration for file: {}. Defaulting to 0.", audioFile.getName(), e);
            return 0.0;
        }
    }

    /**
     * Lưu file âm thanh và tạo bản ghi trong database
     */
    public Recording storeAndCreateRecording(MultipartFile file, String title, String userId, Double durationFromFrontend) throws IOException {
        File tempFile = null;
        try {
            // Khởi tạo thư mục upload
            initUploadDirectory();

            // Kiểm tra file hợp lệ
            validateAudioFile(file);

            // Tạo tên file duy nhất
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;

            // Lưu file vào thư mục
            Path targetLocation = Paths.get(uploadDir).resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Double duration;
            if (durationFromFrontend != null && durationFromFrontend > 0) {
                duration = durationFromFrontend;
                logger.info("Using duration from frontend: {}", duration);
            } else {
                // Chuyển MultipartFile thành File để trích xuất duration
                tempFile = Files.createTempFile("rec-", "." + fileExtension).toFile();
                try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                    fos.write(file.getBytes());
                }
                duration = getAudioDuration(tempFile);
                logger.info("Extracted duration from backend: {} for file: {}", duration, originalFilename);
            }

            // Tạo đối tượng Recording
            Recording recording = new Recording();
            recording.setUserId(userId);
            recording.setTitle(title);
            recording.setRecordingDate(LocalDateTime.now());
            recording.setAudioFileName(originalFilename);
            recording.setAudioFileUrl("/api/recordings/files/" + uniqueFilename);
            recording.setAudioFileSize(file.getSize());
            recording.setDurationSeconds(duration);
            recording.setStorageType("LOCAL");
            recording.setProcessingStatus("PENDING");

            // Lưu vào database
            Recording savedRecording = recordingRepository.save(recording);

            // TODO: Kích hoạt xử lý AI bất đồng bộ ở phiên bản sau
            // processRecordingAsync(savedRecording.getId());

            return savedRecording;

        } finally {
            // Xóa file tạm
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    /**
     * Lấy danh sách bản ghi theo userId
     */
    public List<Recording> getRecordingsByUserId(String userId) {
        return recordingRepository.findByUserIdOrderByRecordingDateDesc(userId);
    }

    /**
     * Lấy chi tiết một bản ghi
     */
    public Optional<Recording> getRecordingById(String id) {
        return recordingRepository.findById(id);
    }

    /**
     * Lấy file âm thanh để phát
     */
    public Resource loadAudioFile(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File không tồn tại hoặc không thể đọc: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File không hợp lệ: " + filename, e);
        }
    }

    /**
     * Xóa bản ghi và file âm thanh
     */
    public void deleteRecording(String id, String userId) {
        Optional<Recording> recordingOpt = recordingRepository.findById(id);
        
        if (recordingOpt.isEmpty()) {
            throw new RuntimeException("Bản ghi không tồn tại");
        }

        Recording recording = recordingOpt.get();
        
        // Kiểm tra quyền sở hữu
        if (!recording.getUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền xóa bản ghi này");
        }

        try {
            // Xóa file vật lý
            String filename = recording.getAudioFileUrl().substring(
                recording.getAudioFileUrl().lastIndexOf("/") + 1
            );
            Path filePath = Paths.get(uploadDir).resolve(filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }

            // Xóa bản ghi trong database
            recordingRepository.delete(recording);

        } catch (IOException e) {
            throw new RuntimeException("Không thể xóa file âm thanh: " + e.getMessage(), e);
        }
    }

    /**
     * Cập nhật thông tin bản ghi
     */
    public Recording updateRecording(String id, String title, List<String> tagIds, String userId) {
        Optional<Recording> recordingOpt = recordingRepository.findById(id);
        
        if (recordingOpt.isEmpty()) {
            throw new RuntimeException("Bản ghi không tồn tại");
        }

        Recording recording = recordingOpt.get();
        
        // Kiểm tra quyền sở hữu
        if (!recording.getUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền chỉnh sửa bản ghi này");
        }

        // Cập nhật thông tin
        if (title != null && !title.trim().isEmpty()) {
            recording.setTitle(title);
        }
        
        if (tagIds != null) {
            recording.setTagIds(tagIds);
        }

        return recordingRepository.save(recording);
    }

    /**
     * Lấy thống kê bản ghi của user
     */
    public RecordingStats getRecordingStats(String userId) {
        List<Recording> allRecordings = recordingRepository.findByUserIdOrderByRecordingDateDesc(userId);
        
        long totalCount = allRecordings.size();
        long pendingCount = allRecordings.stream()
            .mapToLong(r -> "PENDING".equals(r.getProcessingStatus()) ? 1 : 0)
            .sum();
        long completedCount = allRecordings.stream()
            .mapToLong(r -> "COMPLETED".equals(r.getProcessingStatus()) ? 1 : 0)
            .sum();
        long totalSize = allRecordings.stream()
            .mapToLong(r -> r.getAudioFileSize() != null ? r.getAudioFileSize() : 0)
            .sum();

        return new RecordingStats(totalCount, pendingCount, completedCount, totalSize);
    }

    /**
     * Class thống kê
     */
    public static class RecordingStats {
        private final long totalCount;
        private final long pendingCount;
        private final long completedCount;
        private final long totalSize;

        public RecordingStats(long totalCount, long pendingCount, long completedCount, long totalSize) {
            this.totalCount = totalCount;
            this.pendingCount = pendingCount;
            this.completedCount = completedCount;
            this.totalSize = totalSize;
        }

        public long getTotalCount() { return totalCount; }
        public long getPendingCount() { return pendingCount; }
        public long getCompletedCount() { return completedCount; }
        public long getTotalSize() { return totalSize; }
    }
}
