package com.workify.backend.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.lowagie.text.DocumentException;
import com.workify.backend.dto.NoteCreateRequest;
import com.workify.backend.dto.NoteResponse;
import com.workify.backend.dto.NoteUpdateRequest;
import com.workify.backend.dto.TagResponse;
import com.workify.backend.model.Attachment;
import com.workify.backend.model.Note;
import com.workify.backend.repository.NoteRepository;

@Service
public class NoteService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private TagService tagService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Tạo note mới
     */
    public NoteResponse createNote(NoteCreateRequest request, String authorId) {
        // Validate tagIds nếu có
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            for (String tagId : request.getTagIds()) {
                if (!tagService.isTagOwnedByUser(tagId, authorId)) {
                    throw new IllegalArgumentException("Tag với ID '" + tagId + "' không tồn tại hoặc không thuộc về bạn");
                }
            }
        }
        
        Note note = new Note(request.getTitle(), request.getContent(), authorId);
        note.setTagIds(request.getTagIds());
        note.setIsPinned(request.getIsPinned());
        
        Note savedNote = noteRepository.save(note);
        return populateTagsInResponse(savedNote);
    }
    
    /**
     * Helper method: Populate tag details vào NoteResponse
     */
    private NoteResponse populateTagsInResponse(Note note) {
        NoteResponse response = new NoteResponse(note);
        
        if (note.getTagIds() != null && !note.getTagIds().isEmpty()) {
            List<TagResponse> tags = new ArrayList<>();
            for (String tagId : note.getTagIds()) {
                Optional<TagResponse> tagOpt = tagService.getTagById(tagId, note.getAuthorId());
                tagOpt.ifPresent(tags::add);
            }
            response.setTags(tags);
        }
        
        return response;
    }
    
    /**
     * Lấy tất cả note của user
     */
    public List<NoteResponse> getAllNotesByUser(String authorId) {
        List<Note> notes = noteRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy note theo ID
     */
    public Optional<NoteResponse> getNoteById(String noteId, String authorId) {
        Optional<Note> note = noteRepository.findById(noteId);
        
        if (note.isPresent() && note.get().getAuthorId().equals(authorId)) {
            return Optional.of(populateTagsInResponse(note.get()));
        }
        
        return Optional.empty();
    }
    
    /**
     * Cập nhật note
     */
    public Optional<NoteResponse> updateNote(String noteId, NoteUpdateRequest request, String authorId) {
        Optional<Note> noteOpt = noteRepository.findById(noteId);
        
        if (noteOpt.isEmpty() || !noteOpt.get().getAuthorId().equals(authorId)) {
            return Optional.empty();
        }
        
        Note note = noteOpt.get();
        
        // Chỉ cập nhật các trường không null
        if (request.getTitle() != null) {
            note.setTitle(request.getTitle());
        }
        
        if (request.getContent() != null) {
            note.setContent(request.getContent());
        }
        
        // GĐ5: Cập nhật tagIds nếu có
        if (request.getTagIds() != null) {
            // Validate tagIds
            for (String tagId : request.getTagIds()) {
                if (!tagService.isTagOwnedByUser(tagId, authorId)) {
                    throw new IllegalArgumentException("Tag với ID '" + tagId + "' không tồn tại hoặc không thuộc về bạn");
                }
            }
            note.setTagIds(request.getTagIds());
        }
        
        // GĐ5: Cập nhật isPinned nếu có
        if (request.getIsPinned() != null) {
            note.setIsPinned(request.getIsPinned());
        }
        
        Note updatedNote = noteRepository.save(note);
        return Optional.of(populateTagsInResponse(updatedNote));
    }
    
    /**
     * Xóa note
     */
    public boolean deleteNote(String noteId, String authorId) {
        Optional<Note> note = noteRepository.findById(noteId);
        
        if (note.isPresent() && note.get().getAuthorId().equals(authorId)) {
            noteRepository.deleteById(noteId);
            return true;
        }
        
        return false;
    }
    
    /**
     * Tìm kiếm note theo tiêu đề
     */
    public List<NoteResponse> searchNotesByTitle(String authorId, String keyword) {
        List<Note> notes = noteRepository.findByAuthorIdAndTitleContainingIgnoreCase(authorId, keyword);
        return notes.stream()
                .map(NoteResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Đếm số lượng note của user
     */
    public long countNotesByUser(String authorId) {
        return noteRepository.countByAuthorId(authorId);
    }
    
    // GĐ5: Pin/Unpin note
    public Optional<NoteResponse> togglePinNote(String noteId, String authorId) {
        Optional<Note> noteOpt = noteRepository.findById(noteId);
        
        if (noteOpt.isEmpty() || !noteOpt.get().getAuthorId().equals(authorId)) {
            return Optional.empty();
        }
        
        Note note = noteOpt.get();
        note.setIsPinned(!note.getIsPinned()); // Toggle pin status
        
        Note updatedNote = noteRepository.save(note);
        return Optional.of(populateTagsInResponse(updatedNote));
    }
    
    // GĐ5: Lấy tất cả note được pin của user
    public List<NoteResponse> getPinnedNotesByUser(String authorId) {
        List<Note> notes = noteRepository.findByAuthorIdAndIsPinnedTrueOrderByCreatedAtDesc(authorId);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ5: Cập nhật tags cho note
    public Optional<NoteResponse> updateNoteTags(String noteId, List<String> tagIds, String authorId) {
        Optional<Note> noteOpt = noteRepository.findById(noteId);
        
        if (noteOpt.isEmpty() || !noteOpt.get().getAuthorId().equals(authorId)) {
            return Optional.empty();
        }
        
        Note note = noteOpt.get();
        
        // Validate tagIds
        if (tagIds != null) {
            for (String tagId : tagIds) {
                if (!tagService.isTagOwnedByUser(tagId, authorId)) {
                    throw new IllegalArgumentException("Tag với ID '" + tagId + "' không tồn tại hoặc không thuộc về bạn");
                }
            }
        }
        
        note.setTagIds(tagIds);
        
        Note updatedNote = noteRepository.save(note);
        return Optional.of(populateTagsInResponse(updatedNote));
    }
    
    // GĐ6: Tìm kiếm note theo tagId
    public List<NoteResponse> searchNotesByTag(String authorId, String tagId) {
        // Validate tag ownership
        if (!tagService.isTagOwnedByUser(tagId, authorId)) {
            throw new IllegalArgumentException("Tag không tồn tại hoặc không thuộc về bạn");
        }
        
        List<Note> notes = noteRepository.findByAuthorIdAndTagIdsContainingOrderByCreatedAtDesc(authorId, tagId);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ6: Tìm kiếm note theo nhiều tagIds
    public List<NoteResponse> searchNotesByTags(String authorId, List<String> tagIds) {
        // Validate all tags
        for (String tagId : tagIds) {
            if (!tagService.isTagOwnedByUser(tagId, authorId)) {
                throw new IllegalArgumentException("Tag với ID '" + tagId + "' không tồn tại hoặc không thuộc về bạn");
            }
        }
        
        List<Note> notes = noteRepository.findByAuthorIdAndTagIdsInOrderByCreatedAtDesc(authorId, tagIds);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ6: Tìm kiếm note theo keyword (trong title và content)
    public List<NoteResponse> searchNotesByKeyword(String authorId, String keyword) {
        List<Note> notes = noteRepository.findByAuthorIdAndTitleContainingIgnoreCaseOrAuthorIdAndContentContainingIgnoreCaseOrderByCreatedAtDesc(
            authorId, keyword, authorId, keyword);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ6: Lấy tất cả notes của user (method này đã có trong getAllNotes nhưng cần tách riêng)
    public List<NoteResponse> getNotesByUser(String authorId) {
        List<Note> notes = noteRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
        return notes.stream()
                .map(this::populateTagsInResponse)
                .collect(Collectors.toList());
    }
    
    // GĐ6: Lấy danh sách tất cả tags unique của user (deprecated - dùng TagService thay thế)
    @Deprecated
    public List<String> getAllTagsByUser(String authorId) {
        // Gọi TagService để lấy danh sách tags
        List<TagResponse> userTags = tagService.getAllTagsByUser(authorId);
        return userTags.stream()
                .map(TagResponse::getName)
                .collect(Collectors.toList());
    }
    
    /**
     * GĐ7: Upload file cho note với kiểm tra giới hạn 5MB
     */
    public Note uploadFiles(String noteId, String authorId, List<MultipartFile> files) throws IOException {
        // Tìm note
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        // Kiểm tra quyền
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền upload file cho note này");
        }
        
        // Tính tổng dung lượng hiện tại
        long currentTotalSize = fileStorageService.calculateTotalSize(note.getAttachments());
        
        // Tính tổng dung lượng file mới
        long newFilesTotalSize = files.stream()
                .mapToLong(MultipartFile::getSize)
                .sum();
        
        // Kiểm tra giới hạn 5MB
        fileStorageService.validateTotalFileSize(currentTotalSize, newFilesTotalSize);
        
        // Upload từng file
        List<Attachment> newAttachments = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                Attachment attachment = fileStorageService.uploadFile(file, authorId);
                newAttachments.add(attachment);
            } catch (Exception e) {
                // Rollback: xóa các file đã upload thành công
                for (Attachment uploaded : newAttachments) {
                    fileStorageService.deleteFile(uploaded.getFileUrl());
                }
                throw new RuntimeException("Lỗi upload file: " + e.getMessage(), e);
            }
        }
        
        // Thêm attachments vào note
        note.getAttachments().addAll(newAttachments);
        note.setUpdatedAt(LocalDateTime.now());
        
        return noteRepository.save(note);
    }
    
    /**
     * GĐ7: Xóa file khỏi note
     */
    public Note deleteFileFromNote(String noteId, String authorId, String fileName) {
        // Tìm note
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        // Kiểm tra quyền
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền xóa file trong note này");
        }
        
        // Tìm và xóa attachment
        Iterator<Attachment> iterator = note.getAttachments().iterator();
        boolean found = false;
        
        while (iterator.hasNext()) {
            Attachment attachment = iterator.next();
            if (attachment.getFileName().equals(fileName)) {
                // Xóa file khỏi storage
                fileStorageService.deleteFile(attachment.getFileUrl());
                
                // Xóa khỏi list
                iterator.remove();
                found = true;
                break;
            }
        }
        
        if (!found) {
            throw new RuntimeException("File không tồn tại trong note");
        }
        
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }
    
    /**
     * GĐ7: Lấy thông tin file của note
     */
    public List<Attachment> getNoteFiles(String noteId, String authorId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền xem file trong note này");
        }
        
        return note.getAttachments();
    }
    
    /**
     * GĐ7+: Lấy file để hiển thị (cho ảnh trong editor)
     */
    public byte[] getFileContent(String noteId, String authorId, String fileName) throws IOException {
        // Tìm note
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        // Kiểm tra quyền
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền xem file trong note này");
        }
        
        // Tìm attachment
        Attachment attachment = note.getAttachments().stream()
                .filter(att -> att.getFileName().equals(fileName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("File không tồn tại"));
        
        // Đọc file từ storage
        return fileStorageService.readFileContent(attachment.getFileUrl());
    }
    
    /**
     * GĐ7+: Lấy thông tin file (content type, etc.)
     */
    public Attachment getFileInfo(String noteId, String authorId, String fileName) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền xem file trong note này");
        }
        
        return note.getAttachments().stream()
                .filter(att -> att.getFileName().equals(fileName))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("File không tồn tại"));
    }
    
    /**
     * GĐ8: Export note to PDF format
     */
    public byte[] exportNoteToPdf(String noteId, String authorId) throws IOException {
        Note note = getNoteForExport(noteId, authorId);
        
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            // Create PDF document
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, outputStream);
            document.open();
            
            // Add title
            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 18, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph(note.getTitle(), titleFont);
            title.setSpacingAfter(10f);
            document.add(title);
            
            // Add metadata
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            com.lowagie.text.Font metaFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.ITALIC);
            String metaText = "Ngày tạo: " + note.getCreatedAt().format(formatter) + "\n" +
                            "Cập nhật lần cuối: " + note.getUpdatedAt().format(formatter);
            com.lowagie.text.Paragraph meta = new com.lowagie.text.Paragraph(metaText, metaFont);
            meta.setSpacingAfter(20f);
            document.add(meta);
            
            // Process content with images
            processContentForPdf(note.getContent(), document);
            
            // Add tags if any
            if (note.getTagIds() != null && !note.getTagIds().isEmpty()) {
                List<String> tagNames = note.getTagIds().stream()
                    .map(tagId -> tagService.getTagById(tagId, note.getAuthorId()))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .map(tag -> tag.getName())
                    .collect(Collectors.toList());
                
                if (!tagNames.isEmpty()) {
                    com.lowagie.text.Font tagFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.ITALIC);
                    String tagText = "\nTags: " + String.join(", ", tagNames);
                    com.lowagie.text.Paragraph tags = new com.lowagie.text.Paragraph(tagText, tagFont);
                    document.add(tags);
                }
            }
            
            document.close();
            System.out.println("PDF generated successfully for note: " + note.getTitle());
            return outputStream.toByteArray();
            
        } catch (DocumentException e) {
            System.err.println("DocumentException in PDF generation: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Error generating PDF - Document formatting issue: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("Unexpected error in PDF generation: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Error generating PDF - Unexpected error: " + e.getMessage(), e);
        }
    }
    
    /**
     * GĐ8: Export note to DOCX format
     */
    public byte[] exportNoteToDocx(String noteId, String authorId) throws IOException {
        Note note = getNoteForExport(noteId, authorId);
        
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
             XWPFDocument document = new XWPFDocument()) {
            
            // Add title
            XWPFParagraph titleParagraph = document.createParagraph();
            XWPFRun titleRun = titleParagraph.createRun();
            titleRun.setText(note.getTitle());
            titleRun.setBold(true);
            titleRun.setFontSize(16);
            
            // Add metadata
            XWPFParagraph metaParagraph = document.createParagraph();
            XWPFRun metaRun = metaParagraph.createRun();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            String metaText = "Ngày tạo: " + note.getCreatedAt().format(formatter) + 
                            "\nCập nhật lần cuối: " + note.getUpdatedAt().format(formatter);
            metaRun.setText(metaText);
            metaRun.setFontSize(10);
            metaRun.setItalic(true);
            
            // Process content with images for DOCX
            processContentForDocx(note.getContent(), document);
            
            // Add tags if any
            if (note.getTagIds() != null && !note.getTagIds().isEmpty()) {
                XWPFParagraph tagsParagraph = document.createParagraph();
                XWPFRun tagsRun = tagsParagraph.createRun();
                List<String> tagNames = note.getTagIds().stream()
                    .map(tagId -> tagService.getTagById(tagId, authorId))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .map(tag -> tag.getName())
                    .collect(Collectors.toList());
                tagsRun.setText("\nTags: " + String.join(", ", tagNames));
                tagsRun.setItalic(true);
            }
            
            document.write(outputStream);
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            throw new IOException("Error generating DOCX: " + e.getMessage(), e);
        }
    }
    
    /**
     * Helper method to get note with permission check
     */
    private Note getNoteForExport(String noteId, String authorId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note không tồn tại"));
        
        if (!note.getAuthorId().equals(authorId)) {
            throw new RuntimeException("Không có quyền export note này");
        }
        
        return note;
    }
    
    /**
     * Helper method to strip HTML tags for plain text
     */
    private String stripHtmlTags(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]+>", "").replaceAll("&nbsp;", " ");
    }
    
    /**
     * Helper method to convert HTML to plain text using Jsoup
     */
    private String htmlToPlainText(String html) {
        if (html == null || html.trim().isEmpty()) {
            return "";
        }
        
        try {
            // Parse HTML and extract text
            Document doc = Jsoup.parse(html);
            return doc.text();
        } catch (Exception e) {
            // If parsing fails, fallback to simple regex
            return stripHtmlTags(html);
        }
    }
    
    /**
     * Helper method to process content for PDF with base64 images
     */
    private void processContentForPdf(String htmlContent, com.lowagie.text.Document document) throws DocumentException, IOException {
        if (htmlContent == null || htmlContent.trim().isEmpty()) {
            return;
        }
        
        try {
            // Parse HTML content
            Document doc = Jsoup.parse(htmlContent);
            
            // Find all elements and process them
            for (Element element : doc.body().getAllElements()) {
                if ("img".equals(element.tagName())) {
                    // Process image elements
                    processImageForPdf(element, document);
                } else if (element.hasText() && element.children().isEmpty()) {
                    // Process text elements
                    String text = element.text().trim();
                    if (!text.isEmpty()) {
                        com.lowagie.text.Font contentFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12);
                        com.lowagie.text.Paragraph paragraph = new com.lowagie.text.Paragraph(text, contentFont);
                        paragraph.setSpacingAfter(10f);
                        document.add(paragraph);
                    }
                }
            }
            
            // If no specific elements found, add as plain text
            if (doc.body().getAllElements().size() <= 2) { // Only html and body
                String plainText = doc.text();
                if (!plainText.trim().isEmpty()) {
                    com.lowagie.text.Font contentFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12);
                    com.lowagie.text.Paragraph paragraph = new com.lowagie.text.Paragraph(plainText, contentFont);
                    paragraph.setSpacingAfter(20f);
                    document.add(paragraph);
                }
            }
            
        } catch (Exception e) {
            // Fallback to plain text if HTML parsing fails
            String plainText = htmlToPlainText(htmlContent);
            if (!plainText.trim().isEmpty()) {
                com.lowagie.text.Font contentFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12);
                com.lowagie.text.Paragraph paragraph = new com.lowagie.text.Paragraph(plainText, contentFont);
                paragraph.setSpacingAfter(20f);
                document.add(paragraph);
            }
        }
    }
    
    /**
     * Helper method to process base64 images for PDF
     */
    private void processImageForPdf(Element imgElement, com.lowagie.text.Document document) throws DocumentException {
        try {
            String src = imgElement.attr("src");
            
            if (src.startsWith("data:image/")) {
                // Extract base64 data
                String base64Data = extractBase64FromDataUrl(src);
                if (base64Data != null) {
                    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                    
                    // Create iText image
                    com.lowagie.text.Image image = com.lowagie.text.Image.getInstance(imageBytes);
                    
                    // Scale image to fit page
                    float maxWidth = document.getPageSize().getWidth() - document.leftMargin() - document.rightMargin();
                    float maxHeight = 300f; // Max height for images
                    
                    if (image.getWidth() > maxWidth) {
                        float scale = maxWidth / image.getWidth();
                        image.scalePercent(scale * 100);
                    }
                    if (image.getScaledHeight() > maxHeight) {
                        float scale = maxHeight / image.getScaledHeight();
                        image.scalePercent(image.getScaledWidth() * scale / image.getWidth() * 100);
                    }
                    
                    image.setSpacingBefore(10f);
                    image.setSpacingAfter(10f);
                    image.setAlignment(com.lowagie.text.Image.MIDDLE);
                    
                    document.add(image);
                }
            } else {
                // Non-base64 image, add placeholder text
                com.lowagie.text.Font placeholderFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.ITALIC);
                com.lowagie.text.Paragraph placeholder = new com.lowagie.text.Paragraph("[Hình ảnh: " + (src.length() > 50 ? src.substring(0, 50) + "..." : src) + "]", placeholderFont);
                placeholder.setSpacingAfter(10f);
                document.add(placeholder);
            }
            
        } catch (Exception e) {
            System.err.println("Error processing image for PDF: " + e.getMessage());
            // Add error placeholder
            com.lowagie.text.Font errorFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.ITALIC);
            com.lowagie.text.Paragraph error = new com.lowagie.text.Paragraph("[Lỗi khi xử lý hình ảnh]", errorFont);
            error.setSpacingAfter(10f);
            try {
                document.add(error);
            } catch (DocumentException de) {
                // Ignore if can't add error message
            }
        }
    }
    
    /**
     * Helper method to extract base64 data from data URL
     */
    private String extractBase64FromDataUrl(String dataUrl) {
        if (dataUrl == null || !dataUrl.startsWith("data:")) {
            return null;
        }
        
        int commaIndex = dataUrl.indexOf(",");
        if (commaIndex == -1) {
            return null;
        }
        
        return dataUrl.substring(commaIndex + 1);
    }
    
    /**
     * Helper method to process content for DOCX with base64 images
     */
    private void processContentForDocx(String htmlContent, XWPFDocument document) throws IOException {
        if (htmlContent == null || htmlContent.trim().isEmpty()) {
            return;
        }
        
        try {
            // Parse HTML content
            Document doc = Jsoup.parse(htmlContent);
            
            // Find all elements and process them
            for (Element element : doc.body().getAllElements()) {
                if ("img".equals(element.tagName())) {
                    // Process image elements
                    processImageForDocx(element, document);
                } else if (element.hasText() && element.children().isEmpty()) {
                    // Process text elements
                    String text = element.text().trim();
                    if (!text.isEmpty()) {
                        XWPFParagraph paragraph = document.createParagraph();
                        XWPFRun run = paragraph.createRun();
                        run.setText(text);
                    }
                }
            }
            
            // If no specific elements found, add as plain text
            if (doc.body().getAllElements().size() <= 2) { // Only html and body
                String plainText = doc.text();
                if (!plainText.trim().isEmpty()) {
                    XWPFParagraph paragraph = document.createParagraph();
                    XWPFRun run = paragraph.createRun();
                    run.setText(plainText);
                }
            }
            
        } catch (Exception e) {
            // Fallback to plain text if HTML parsing fails
            String plainText = htmlToPlainText(htmlContent);
            if (!plainText.trim().isEmpty()) {
                XWPFParagraph paragraph = document.createParagraph();
                XWPFRun run = paragraph.createRun();
                run.setText(plainText);
            }
        }
    }
    
    /**
     * Helper method to process base64 images for DOCX
     */
    private void processImageForDocx(Element imgElement, XWPFDocument document) {
        try {
            String src = imgElement.attr("src");
            
            if (src.startsWith("data:image/")) {
                // Extract base64 data
                String base64Data = extractBase64FromDataUrl(src);
                if (base64Data != null) {
                    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                    
                    // Determine image format
                    int format = getImageFormat(src);
                    if (format != -1) {
                        // Create new paragraph for image
                        XWPFParagraph paragraph = document.createParagraph();
                        XWPFRun run = paragraph.createRun();
                        
                        // Add image to document
                        try (ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes)) {
                            run.addPicture(bis, format, "image", 
                                          org.apache.poi.util.Units.toEMU(300), // width
                                          org.apache.poi.util.Units.toEMU(200)); // height
                        }
                    }
                }
            } else {
                // Non-base64 image, add placeholder text
                XWPFParagraph paragraph = document.createParagraph();
                XWPFRun run = paragraph.createRun();
                run.setText("[Hình ảnh: " + (src.length() > 50 ? src.substring(0, 50) + "..." : src) + "]");
                run.setItalic(true);
            }
            
        } catch (Exception e) {
            System.err.println("Error processing image for DOCX: " + e.getMessage());
            // Add error placeholder
            XWPFParagraph paragraph = document.createParagraph();
            XWPFRun run = paragraph.createRun();
            run.setText("[Lỗi khi xử lý hình ảnh]");
            run.setItalic(true);
        }
    }
    
    /**
     * Helper method to get image format for DOCX
     */
    private int getImageFormat(String dataUrl) {
        if (dataUrl.contains("image/png")) {
            return XWPFDocument.PICTURE_TYPE_PNG;
        } else if (dataUrl.contains("image/jpeg") || dataUrl.contains("image/jpg")) {
            return XWPFDocument.PICTURE_TYPE_JPEG;
        } else if (dataUrl.contains("image/gif")) {
            return XWPFDocument.PICTURE_TYPE_GIF;
        }
        return XWPFDocument.PICTURE_TYPE_JPEG; // Default to JPEG
    }
}
