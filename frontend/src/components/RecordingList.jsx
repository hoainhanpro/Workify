import React, { useState } from 'react';
import recordingService from '../services/recordingService';
import RecordingPlayer from './RecordingPlayer';
import ConfirmModal from './ConfirmModal'; // Import a custom confirm modal
import { FaCalendarAlt, FaFileAudio, FaSave, FaClock, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaQuestionCircle, FaPlay, FaTrash } from 'react-icons/fa';
import './RecordingList.css';

const RecordingList = ({ recordings, stats, loading, error, onRefresh }) => {
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState(null);

  const handlePlayRecording = (recording) => {
    setSelectedRecording(recording);
    setShowPlayer(true);
  };

  const openDeleteConfirm = (recordingId) => {
    setRecordingToDelete(recordingId);
    setShowConfirmModal(true);
  };

  const handleDeleteRecording = async () => {
    if (!recordingToDelete) return;

    try {
      await recordingService.deleteRecording(recordingToDelete);
      onRefresh(); // Call the refresh function passed from parent
    } catch (err) {
      // You might want to show a more user-friendly error message here
      alert('Lỗi khi xóa bản ghi: ' + err.message);
    } finally {
      setShowConfirmModal(false);
      setRecordingToDelete(null);
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
    return <div className="loading">Đang tải danh sách bản ghi...</div>;
  }

  return (
    <div className="recording-list-container">

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

      {error && <div className="error-message">{error}</div>}

      {recordings.length === 0 && !loading ? (
        <div className="empty-state">
          <p>Bạn chưa có bản ghi âm nào.</p>
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
                  onClick={() => openDeleteConfirm(recording.id)}
                >
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDeleteRecording}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa bản ghi này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default RecordingList;
