const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Token management - sử dụng cùng key với authService
const getAuthToken = () => {
  const token = localStorage.getItem('workify_access_token') || localStorage.getItem('token');
  if (!token) {
    console.warn('No auth token found in localStorage');
  }
  return token;
};

class RecordingService {
  /**
   * Upload file ghi âm
   */
  async uploadRecording(file, title, duration) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (duration) {
      formData.append('duration', duration);
    }

    const response = await fetch(`${API_BASE_URL}/recordings/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Không thể tải lên file');
    }

    return response.json();
  }

  /**
   * Lấy danh sách bản ghi của người dùng
   */
  async getUserRecordings() {
    const response = await fetch(`${API_BASE_URL}/recordings`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401 Unauthorized - Phiên đăng nhập đã hết hạn');
      }
      throw new Error(`Không thể lấy danh sách bản ghi (${response.status})`);
    }

    return response.json();
  }

  /**
   * Lấy chi tiết một bản ghi
   */
  async getRecordingById(id) {
    const response = await fetch(`${API_BASE_URL}/recordings/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin bản ghi');
    }

    return response.json();
  }

  /**
   * Cập nhật thông tin bản ghi
   */
  async updateRecording(id, data) {
    const response = await fetch(`${API_BASE_URL}/recordings/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Không thể cập nhật bản ghi');
    }

    return response.json();
  }

  /**
   * Xóa bản ghi
   */
  async deleteRecording(id) {
    const response = await fetch(`${API_BASE_URL}/recordings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Không thể xóa bản ghi');
    }

    return response.json();
  }

  /**
   * Lấy thống kê bản ghi
   */
  async getRecordingStats() {
    const response = await fetch(`${API_BASE_URL}/recordings/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401 Unauthorized - Phiên đăng nhập đã hết hạn');
      }
      throw new Error(`Không thể lấy thống kê bản ghi (${response.status})`);
    }

    return response.json();
  }

  /**
   * Lấy URL để phát file âm thanh
   */
  getAudioFileUrl(filename) {
    return `${API_BASE_URL}/recordings/files/${filename}?Authorization=Bearer%20${getAuthToken()}`;
  }

  /**
   * Kiểm tra định dạng file âm thanh hợp lệ
   */
  validateAudioFile(file) {
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
      'audio/aac', 'audio/ogg', 'audio/flac', 'audio/x-ms-wma'
    ];
    
    const allowedExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma'];
    
    // Kiểm tra theo MIME type
    if (allowedTypes.includes(file.type)) {
      return true;
    }
    
    // Kiểm tra theo phần mở rộng file
    const extension = file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
  }

  /**
   * Format kích thước file
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Cập nhật duration của recording
   */
  async updateRecordingDuration(recordingId, duration) {
    const response = await fetch(`${API_BASE_URL}/recordings/${recordingId}/duration`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ duration })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Không thể cập nhật duration');
    }

    return response.json();
  }

  /**
   * Format thời lượng (giây -> phút:giây)
   */
  formatDuration(seconds) {
    if (!seconds) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export default new RecordingService();
