/**
 * GĐ7: File Service - Xử lý upload/download file cho note
 * Giới hạn: Tổng dung lượng file trong 1 note < 5MB
 */

import { API_CONFIG } from '../config/oauth';

const API_BASE_URL = API_CONFIG.baseUrl;

/**
 * Upload files cho note (giới hạn 5MB/note)
 */
export const uploadFilesToNote = async (noteId, files) => {
    try {
        const token = localStorage.getItem('workify_access_token');
        if (!token) {
            throw new Error('Không có token xác thực');
        }

        // Validate files
        if (!files || files.length === 0) {
            throw new Error('Vui lòng chọn ít nhất 1 file');
        }

        // Kiểm tra tổng dung lượng trước khi upload
        const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (totalSize > maxSize) {
            throw new Error(`Tổng dung lượng file vượt quá ${maxSize / (1024 * 1024)}MB`);
        }

        // Tạo FormData
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        const response = await fetch(`${API_BASE_URL}/notes/${noteId}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Lỗi upload file');
        }

        return data;
    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }
};

/**
 * Lấy danh sách file của note
 */
export const getNoteFiles = async (noteId) => {
    try {
        const token = localStorage.getItem('workify_access_token');
        if (!token) {
            throw new Error('Không có token xác thực');
        }

        const response = await fetch(`${API_BASE_URL}/notes/${noteId}/files`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Lỗi khi lấy danh sách file');
        }

        return data;
    } catch (error) {
        console.error('Error fetching note files:', error);
        throw error;
    }
};

/**
 * Xóa file khỏi note
 */
export const deleteFileFromNote = async (noteId, fileName) => {
    try {
        const token = localStorage.getItem('workify_access_token');
        if (!token) {
            throw new Error('Không có token xác thực');
        }

        const response = await fetch(`${API_BASE_URL}/notes/${noteId}/files/${encodeURIComponent(fileName)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Lỗi khi xóa file');
        }

        return data;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

/**
 * Download file từ note
 */
export const downloadFileFromNote = async (noteId, fileName) => {
    try {
        const token = localStorage.getItem('workify_access_token');
        if (!token) {
            throw new Error('Không có token xác thực');
        }

        const response = await fetch(`${API_BASE_URL}/notes/${noteId}/files/${encodeURIComponent(fileName)}/download`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error('Lỗi khi download file');
        }

        // Lấy blob data
        const blob = await response.blob();
        
        // Tạo URL tạm thời và download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: 'Download thành công' };
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
};

/**
 * Format file size cho hiển thị
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Kiểm tra loại file được phép
 */
export const isFileTypeAllowed = (fileName) => {
    const allowedExtensions = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'txt', 'rtf', 'jpg', 'jpeg', 'png', 'gif', 'bmp'
    ];
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(extension);
};

/**
 * Validate files trước khi upload
 */
export const validateFiles = (files) => {
    const errors = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    let totalSize = 0;

    Array.from(files).forEach((file, index) => {
        // Kiểm tra loại file
        if (!isFileTypeAllowed(file.name)) {
            errors.push(`File "${file.name}" không được hỗ trợ`);
        }
        
        totalSize += file.size;
    });

    // Kiểm tra tổng dung lượng
    if (totalSize > maxSize) {
        errors.push(`Tổng dung lượng file vượt quá ${maxSize / (1024 * 1024)}MB`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        totalSize
    };
};

/**
 * GĐ7+: Upload ảnh cho note và trả về base64 để insert vào content
 */
export const uploadImageToNote = async (noteId, imageFile) => {
    try {
        const token = localStorage.getItem('workify_access_token');
        if (!token) {
            throw new Error('Không có token xác thực');
        }

        // Validate image file
        if (!imageFile) {
            throw new Error('Vui lòng chọn file ảnh');
        }

        // Kiểm tra loại file ảnh
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
        const extension = imageFile.name.split('.').pop()?.toLowerCase();
        if (!imageExtensions.includes(extension)) {
            throw new Error('Chỉ hỗ trợ file ảnh: JPG, JPEG, PNG, GIF, BMP');
        }

        // Kiểm tra kích thước file (tối đa 2MB cho ảnh)
        const maxImageSize = 2 * 1024 * 1024; // 2MB
        if (imageFile.size > maxImageSize) {
            throw new Error('Kích thước ảnh không được vượt quá 2MB');
        }

        // Chuyển file thành base64 data URL
        const base64DataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });

        // Upload file lên server để lưu trữ (tính vào attachment)
        const formData = new FormData();
        formData.append('files', imageFile);

        const response = await fetch(`${API_BASE_URL}/notes/${noteId}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Lỗi upload ảnh');
        }

        // Trả về base64 data URL để insert vào editor
        return {
            success: true,
            imageUrl: base64DataUrl, // Sử dụng base64 thay vì server URL
            fileName: imageFile.name
        };
        
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
