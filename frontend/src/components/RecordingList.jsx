import React, { useState, useEffect } from 'react';
import recordingService from '../services/recordingService';
import RecordingUpload from './RecordingUpload';
import RecordingPlayer from './RecordingPlayer';
import { FaCalendarAlt, FaFileAudio, FaSave, FaClock, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaQuestionCircle, FaPlay, FaTrash, FaUpload } from 'react-icons/fa';
import './RecordingList.css';

const RecordingList = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadRecordings();
    loadStats();
  }, []);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const data = await recordingService.getUserRecordings();
      setRecordings(data);
      setError('');
    } catch (err) {
      console.error('Error loading recordings:', err);
      
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await recordingService.getRecordingStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
      // Nếu lỗi 401, có thể token đã hết hạn
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        console.warn('Token có thể đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }
  };

  const handleUploadSuccess = (newRecording) => {
    setRecordings([newRecording, ...recordings]);
    setShowUpload(false);
    loadStats(); // Refresh stats
  };

  const handlePlayRecording = (recording) => {
    setSelectedRecording(recording);
    setShowPlayer(true);
  };

  const handleDeleteRecording = async (recordingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      return;
    }

    try {
      await recordingService.deleteRecording(recordingId);
      setRecordings(recordings.filter(r => r.id !== recordingId));
      loadStats(); // Refresh stats
    } catch (err) {
      alert('Lỗi khi xóa bản ghi: ' + err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <FaCheckCircle className="status-icon completed" />;
      case 'PENDING':
        return <FaHourglassHalf className="status-icon pending" />;
      case 'FAILED':
        return <FaTimesCircle className="status-icon failed" />;
      default:
        return <FaQuestionCircle className="status-icon unknown" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Đã xử lý';
      case 'PENDING':
        return 'Đang xử lý';
      case 'FAILED':
        return 'Lỗi xử lý';
      default:
        return 'Không xác định';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="recording-list-container">
        <div className="loading">Đang tải danh sách bản ghi...</div>
      </div>
    );
  }

  return (
    <div className="recording-list-container">
      <div className="recording-list-header">
        <h2>Bản ghi âm của tôi</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowUpload(true)}
        >
          <FaUpload /> Tải lên bản ghi mới
        </button>
      </div>

      {stats && (
        <div className="recording-stats">
          <div className="stat-item">
            <span className="stat-label">Tổng số bản ghi:</span>
            <span className="stat-value">{stats.totalCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Đang xử lý:</span>
            <span className="stat-value">{stats.pendingCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Đã hoàn thành:</span>
            <span className="stat-value">{stats.completedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tổng dung lượng:</span>
            <span className="stat-value">{recordingService.formatFileSize(stats.totalSize)}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {recordings.length === 0 ? (
        <div className="empty-state">
          <p>Bạn chưa có bản ghi âm nào.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUpload(true)}
          >
            Tải lên bản ghi đầu tiên
          </button>
        </div>
      ) : (
        <div className="recording-list">
          {recordings.map((recording) => (
            <div key={recording.id} className="recording-item">
              <div className="recording-info">
                <div className="recording-title">
                  <h3>{recording.title}</h3>
                  <span className="recording-status">
                    {getStatusIcon(recording.processingStatus)} {getStatusText(recording.processingStatus)}
                  </span>
                </div>
                
                <div className="recording-meta">
                  <span><FaCalendarAlt /> {formatDate(recording.recordingDate)}</span>
                  <span><FaFileAudio /> {recording.audioFileName}</span>
                  <span><FaSave /> {recordingService.formatFileSize(recording.audioFileSize)}</span>
                  {recording.durationSeconds && (
                    <span><FaClock /> {recordingService.formatDuration(recording.durationSeconds)}</span>
                  )}
                </div>

                {recording.processingStatus === 'COMPLETED' && recording.summaryText && (
                  <div className="recording-summary">
                    <p><strong>Tóm tắt:</strong> {recording.summaryText.substring(0, 150)}...</p>
                  </div>
                )}
              </div>

              <div className="recording-actions">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handlePlayRecording(recording)}
                >
                  <FaPlay /> Phát
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteRecording(recording.id)}
                >
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div onClick={e => e.stopPropagation()}>
            <RecordingUpload
              onUploadSuccess={handleUploadSuccess}
              onClose={() => setShowUpload(false)}
            />
          </div>
        </div>
      )}

      {/* Player Modal */}
      {showPlayer && selectedRecording && (
        <div className="modal-overlay" onClick={() => setShowPlayer(false)}>
          <div onClick={e => e.stopPropagation()}>
            <RecordingPlayer
              recording={selectedRecording}
              onClose={() => setShowPlayer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingList;
