import React, { useState, useEffect, useCallback } from 'react';
import RecordingList from '../components/RecordingList';
import RecordingUpload from '../components/RecordingUpload';
import LiveRecorder from '../components/LiveRecorder';
import recordingService from '../services/recordingService';
import { FaUpload, FaMicrophone } from 'react-icons/fa';
import './Recordings.css';

const Recordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);

  const loadRecordings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await recordingService.getUserRecordings();
      setRecordings(data);
      setError('');
    } catch (err) {
      console.error('Error loading recordings:', err);
      setError(err.message.includes('401') ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await recordingService.getRecordingStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  useEffect(() => {
    loadRecordings();
    loadStats();
  }, [loadRecordings, loadStats]);

  const handleRecordingComplete = (newRecording) => {
    setRecordings(prev => [newRecording, ...prev]);
    setShowUploadModal(false);
    setShowRecorder(false);
    loadStats(); // Refresh stats
  };

  return (
    <div className="recordings-page">
      <div className="recordings-header">
        <h1>Quản lý Ghi âm</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            <FaUpload /> Tải lên File
          </button>
          <button className="btn btn-success" onClick={() => setShowRecorder(!showRecorder)}>
            <FaMicrophone /> {showRecorder ? 'Đóng Ghi âm' : 'Ghi âm trực tiếp'}
          </button>
        </div>
      </div>

      {showRecorder && (
        <LiveRecorder onRecordingComplete={handleRecordingComplete} />
      )}

      <RecordingList
        recordings={recordings}
        stats={stats}
        loading={loading}
        error={error}
        onRefresh={loadRecordings}
      />

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <RecordingUpload
              onUploadSuccess={handleRecordingComplete}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Recordings;
