import React, { useState } from 'react';
import recordingService from '../services/recordingService';
import './RecordingUpload.css';

const RecordingUpload = ({ onUploadSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (recordingService.validateAudioFile(selectedFile)) {
        setFile(selectedFile);
        setError('');
        
        // Tự động đặt title từ tên file nếu chưa có
        if (!title) {
          const fileName = selectedFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
          setTitle(fileName);
        }
      } else {
        setError('Định dạng file không được hỗ trợ. Vui lòng chọn file âm thanh (mp3, wav, m4a, aac, ogg, flac, wma)');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Vui lòng chọn file âm thanh');
      return;
    }
    
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const result = await recordingService.uploadRecording(file, title.trim());
      
      // Thông báo thành công
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      // Reset form
      setFile(null);
      setTitle('');
      
      // Đóng modal nếu có
      if (onClose) {
        onClose();
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (!uploading && onClose) {
      onClose();
    }
  };

  return (
    <div className="recording-upload">
      <div className="recording-upload-header">
        <h3>Tải lên bản ghi âm</h3>
        {onClose && (
          <button 
            type="button" 
            className="close-btn"
            onClick={handleCancel}
            disabled={uploading}
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="recording-upload-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="audio-file">Chọn file âm thanh:</label>
          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="file-input"
          />
          {file && (
            <div className="file-info">
              <p><strong>File:</strong> {file.name}</p>
              <p><strong>Kích thước:</strong> {recordingService.formatFileSize(file.size)}</p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="recording-title">Tiêu đề:</label>
          <input
            id="recording-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề cho bản ghi..."
            disabled={uploading}
            maxLength="200"
            className="text-input"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploading}
            className="btn btn-secondary"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={uploading || !file || !title.trim()}
            className="btn btn-primary"
          >
            {uploading ? 'Đang tải lên...' : 'Tải lên'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordingUpload;
