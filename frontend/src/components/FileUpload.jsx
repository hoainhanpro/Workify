import React, { useState, useRef } from 'react';
import { uploadFilesToNote, validateFiles, formatFileSize } from '../services/fileService';
import '../styles/FileUpload.css';

/**
 * GĐ7: Component upload file cho note
 */
const FileUpload = ({ noteId, onUploadSuccess, onUploadError }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Handle file selection
    const handleFileSelect = (files) => {
        if (!files || files.length === 0) return;

        // Validate files
        const validation = validateFiles(files);
        if (!validation.isValid) {
            onUploadError(validation.errors.join('\n'));
            return;
        }

        uploadFiles(files);
    };

    // Upload files
    const uploadFiles = async (files) => {
        setIsUploading(true);
        try {
            const result = await uploadFilesToNote(noteId, files);
            onUploadSuccess(result);
            
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            onUploadError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files);
        }
    };

    // Open file dialog
    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="file-upload-container">
            <div 
                className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp"
                />
                
                {isUploading ? (
                    <div className="upload-progress">
                        <div className="spinner"></div>
                        <p>Đang upload file...</p>
                    </div>
                ) : (
                    <div className="upload-content">
                        <div className="upload-icon">📁</div>
                        <p className="upload-text">
                            Kéo thả file vào đây hoặc <span className="upload-link">click để chọn</span>
                        </p>
                        <p className="upload-note">
                            Hỗ trợ: PDF, Word, Excel, PowerPoint, Text, Hình ảnh
                            <br />
                            <small>Giới hạn: Tổng dung lượng &lt; 5MB</small>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
