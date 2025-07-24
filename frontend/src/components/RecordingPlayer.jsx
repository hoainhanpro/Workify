import React, { useState, useRef, useEffect } from 'react';
import {
  BsPlayFill, BsPauseFill, BsSkipBackwardFill, BsSkipForwardFill, BsVolumeUp,
  BsX, BsClockHistory, BsCalendarDate, BsFileEarmarkText, BsHdd,
  BsArrowRepeat, BsCheckCircleFill, BsXCircleFill, BsHourglassSplit,
  BsCardText, BsClipboardCheck, BsKeyboard, BsThreeDots
} from 'react-icons/bs';
import { FiLoader } from 'react-icons/fi';
import recordingService from '../services/recordingService';
import './RecordingPlayer.css';

const RecordingPlayer = ({ recording, onClose }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recording.durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverTime, setHoverTime] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [durationUpdated, setDurationUpdated] = useState(!!recording.durationSeconds);

  // Load audio file với authorization
  useEffect(() => {
    const loadAudioFile = async () => {
      try {
        setLoading(true);
        setError('');
        
        const filename = recording.audioFileUrl.split('/').pop();
        const token = localStorage.getItem('workify_access_token') || localStorage.getItem('token');
        
        // Fetch audio file với authorization header
        const response = await fetch(`http://localhost:8080/api/recordings/files/${filename}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Tạo blob URL từ response
        const audioBlob = await response.blob();
        const blobUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(blobUrl);
        
      } catch (err) {
        console.error('Error loading audio file:', err);
        setError(`Không thể tải file âm thanh: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadAudioFile();

    // Cleanup function
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [recording.audioFileUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      // Set duration from the audio element if it wasn't passed in props
      if (duration === 0 && audio.duration) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Không thể phát file âm thanh. Vui lòng thử lại.');
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, duration]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        setError('Không thể phát file âm thanh: ' + err.message);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const seekBar = e.currentTarget;
    const rect = seekBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle mouse move for hover preview
  const handleMouseMove = (e) => {
    if (!duration) return;
    
    const seekBar = e.currentTarget;
    const rect = seekBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const hoverTimeValue = percent * duration;
    
    setHoverTime(hoverTimeValue);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  // Keyboard controls
  const handleKeyDown = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        audio.currentTime = Math.min(duration, audio.currentTime + 10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setVolume(prev => Math.min(1, prev + 0.1));
        audio.volume = Math.min(1, audio.volume + 0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setVolume(prev => Math.max(0, prev - 0.1));
        audio.volume = Math.max(0, audio.volume - 0.1);
        break;
    }
  };

  // Focus management for keyboard controls
  useEffect(() => {
    const playerElement = document.querySelector('.recording-player');
    if (playerElement) {
      playerElement.tabIndex = 0;
      playerElement.addEventListener('keydown', handleKeyDown);
      
      return () => {
        playerElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [duration, isPlaying]);

  // Skip forward/backward functions
  const skipBackward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(duration, audio.currentTime + 10);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '00:00';
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="recording-player">
      <div className="recording-player-header">
        <h3>{recording.title}</h3>
        <div className="header-actions">
          {!durationUpdated && duration === 0 && (
            <span className="duration-status"><BsClockHistory /> Đang tính toán...</span>
          )}
          <button 
            type="button" 
            className="close-btn"
            onClick={onClose}
          >
            <BsX />
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="recording-details">
        <div className="detail-row">
          <span className="label"><BsCalendarDate /> Ngày ghi:</span>
          <span className="value">{formatDate(recording.recordingDate)}</span>
        </div>
        <div className="detail-row">
          <span className="label"><BsFileEarmarkText /> File:</span>
          <span className="value">{recording.audioFileName}</span>
        </div>
        <div className="detail-row">
          <span className="label"><BsHdd /> Kích thước:</span>
          <span className="value">{recordingService.formatFileSize(recording.audioFileSize)}</span>
        </div>
        <div className="detail-row">
          <span className="label"><BsArrowRepeat /> Trạng thái:</span>
          <span className="value">
            {recording.processingStatus === 'COMPLETED' ? <><BsCheckCircleFill className="status-icon completed" /> Đã xử lý</> : 
             recording.processingStatus === 'PENDING' ? <><BsHourglassSplit className="status-icon pending" /> Đang xử lý</> : 
             <><BsXCircleFill className="status-icon error" /> Lỗi xử lý</>}
          </span>
        </div>
      </div>

      {loading && (
        <div className="loading-message">
          <FiLoader className="loading-icon" />
          <p>Đang tải file âm thanh...</p>
        </div>
      )}

      {/* Audio Element */}
      {audioUrl && (
        <audio 
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}

      {/* Player Controls */}
      {!loading && audioUrl && (
        <div className="player-controls">
          <div className="main-controls">
            <button 
              className="skip-btn"
              onClick={skipBackward}
              disabled={!!error || !audioUrl}
              title="Lùi 10 giây (←)"
            >
              <BsSkipBackwardFill />
            </button>
            
            <button 
              className="play-pause-btn"
              onClick={togglePlayPause}
              disabled={!!error || !audioUrl}
              title={isPlaying ? "Tạm dừng (Space)" : "Phát (Space)"}
            >
              {isPlaying ? <BsPauseFill /> : <BsPlayFill />}
            </button>
            
            <button 
              className="skip-btn"
              onClick={skipForward}
              disabled={!!error || !audioUrl}
              title="Tiến 10 giây (→)"
            >
              <BsSkipForwardFill />
            </button>
            
            <div className="time-info">
              <span className="current-time">{formatTime(currentTime)}</span>
              <span className="time-separator">/</span>
              <span className="total-time">{formatTime(duration)}</span>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-info">
            <span>Thời gian</span>
            {hoverTime !== null && (
              <span className="hover-time">{formatTime(hoverTime)}</span>
            )}
          </div>
          <div 
            className="progress-bar"
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            title="Click để tua đến vị trí mong muốn"
          >
            <div 
              className="progress-fill"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            <div 
              className="progress-handle"
              style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            {hoverTime !== null && (
              <div 
                className="progress-hover"
                style={{ left: `${duration ? (hoverTime / duration) * 100 : 0}%` }}
              />
            )}
          </div>
        </div>

        {/* Additional Controls */}
        <div className="additional-controls">
          <div className="volume-control">
            <BsVolumeUp />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>

          <div className="speed-control">
            <label>Tốc độ:</label>
            <select 
              value={playbackRate} 
              onChange={handlePlaybackRateChange}
              className="speed-select"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
        </div>
      </div>
      )}

      {/* AI Processing Results */}
      {recording.processingStatus === 'COMPLETED' && (
        <div className="ai-results">
          {recording.transcriptionText && (
            <div className="transcription-section">
              <h4><BsCardText /> Nội dung ghi âm</h4>
              <div className="transcription-content">
                {recording.transcriptionText}
              </div>
            </div>
          )}

          {recording.summaryText && (
            <div className="summary-section">
              <h4><BsClipboardCheck /> Tóm tắt</h4>
              <div className="summary-content">
                {recording.summaryText}
              </div>
            </div>
          )}
        </div>
      )}

      {recording.processingStatus === 'PENDING' && (
        <div className="processing-notice">
          <BsThreeDots className="processing-icon" />
          <p>Đang xử lý AI... Nội dung văn bản và tóm tắt sẽ hiển thị sau khi hoàn thành.</p>
        </div>
      )}

      {/* Keyboard Shortcuts Info */}
      <div className="keyboard-shortcuts">
        <details>
          <summary><BsKeyboard /> Phím tắt</summary>
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <kbd>Space</kbd>
              <span>Phát/Tạm dừng</span>
            </div>
            <div className="shortcut-item">
              <kbd>←</kbd>
              <span>Lùi 10 giây</span>
            </div>
            <div className="shortcut-item">
              <kbd>→</kbd>
              <span>Tiến 10 giây</span>
            </div>
            <div className="shortcut-item">
              <kbd>↑</kbd>
              <span>Tăng âm lượng</span>
            </div>
            <div className="shortcut-item">
              <kbd>↓</kbd>
              <span>Giảm âm lượng</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default RecordingPlayer;
