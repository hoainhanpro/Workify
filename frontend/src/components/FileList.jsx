import React, { useState, useEffect } from 'react';
import { getNoteFiles, deleteFileFromNote, downloadFileFromNote, formatFileSize } from '../services/fileService';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileAlt, FaFileImage, FaFile, FaDownload, FaTrash, FaSpinner } from 'react-icons/fa';
import '../styles/FileUpload.css';

/**
 * GĐ7: Component hiển thị danh sách file của note
 */
const FileList = ({ noteId, refreshTrigger, onFileDeleted, onError }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingFile, setDeletingFile] = useState(null);
    const [downloadingFile, setDownloadingFile] = useState(null);

    // Load files khi component mount hoặc noteId thay đổi
    useEffect(() => {
        if (noteId) {
            loadFiles();
        }
    }, [noteId, refreshTrigger]);

    // Load danh sách file
    const loadFiles = async () => {
        setLoading(true);
        try {
            const result = await getNoteFiles(noteId);
            if (result.success) {
                setFiles(result.data || []);
            }
        } catch (error) {
            onError('Lỗi khi tải danh sách file: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Xóa file
    const handleDeleteFile = async (fileName) => {
        if (!confirm(`Bạn có chắc muốn xóa file "${fileName}"?`)) {
            return;
        }

        setDeletingFile(fileName);
        try {
            const result = await deleteFileFromNote(noteId, fileName);
            if (result.success) {
                setFiles(prev => prev.filter(file => file.fileName !== fileName));
                onFileDeleted(fileName);
            }
        } catch (error) {
            onError('Lỗi khi xóa file: ' + error.message);
        } finally {
            setDeletingFile(null);
        }
    };

    // Download file
    const handleDownloadFile = async (fileName) => {
        setDownloadingFile(fileName);
        try {
            await downloadFileFromNote(noteId, fileName);
        } catch (error) {
            onError('Lỗi khi download file: ' + error.message);
        } finally {
            setDownloadingFile(null);
        }
    };

    // Get file icon based on file type
    const getFileIcon = (fileType) => {
        const type = fileType?.toLowerCase();
        if (type.includes('pdf')) return <FaFilePdf />;
        if (type.includes('doc')) return <FaFileWord />;
        if (type.includes('xls')) return <FaFileExcel />;
        if (type.includes('ppt')) return <FaFilePowerpoint />;
        if (type.includes('txt') || type.includes('rtf')) return <FaFileAlt />;
        if (type.includes('jp') || type.includes('png') || type.includes('gif') || type.includes('bmp')) return <FaFileImage />;
        return <FaFile />;
    };

    // Format upload date
    const formatUploadDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <div className="file-list-loading">
                <div className="spinner"></div>
                <p>Đang tải danh sách file...</p>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="file-list-empty">
                <p>Chưa có file đính kèm</p>
            </div>
        );
    }

    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

    return (
        <div className="file-list-container">
            <div className="file-list-header">
                <h4>File đính kèm ({files.length})</h4>
                <span className="total-size">
                    Tổng: {formatFileSize(totalSize)} / 5MB
                </span>
            </div>

            <div className="file-list">
                {files.map((file, index) => (
                    <div key={index} className="file-item">
                        <div className="file-info">
                            <span className="file-icon">
                                {getFileIcon(file.fileType)}
                            </span>
                            <div className="file-details">
                                <div className="file-name" title={file.fileName}>
                                    {file.fileName}
                                </div>
                                <div className="file-meta">
                                    {formatFileSize(file.size)} • {formatUploadDate(file.uploadedAt)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="file-actions">
                            <button
                                className="download-btn"
                                onClick={() => handleDownloadFile(file.fileName)}
                                disabled={downloadingFile === file.fileName}
                                title="Download file"
                            >
                                {downloadingFile === file.fileName ? <FaSpinner className="spinner-icon" /> : <FaDownload />}
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => handleDeleteFile(file.fileName)}
                                disabled={deletingFile === file.fileName}
                                title="Xóa file"
                            >
                                {deletingFile === file.fileName ? <FaSpinner className="spinner-icon" /> : <FaTrash />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileList;
