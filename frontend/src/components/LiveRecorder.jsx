import React, { useState, useRef } from 'react';
import { BsRecordCircle, BsStopFill, BsTrash } from 'react-icons/bs';
import recordingService from '../services/recordingService';
import PromptModal from './PromptModal'; // Import the custom prompt modal
import './LiveRecorder.css';

const LiveRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // Stop all tracks to turn off the microphone indicator
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Không thể bắt đầu ghi âm. Vui lòng cấp quyền truy cập microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleUpload = async (title) => {
    if (!audioBlob || !title) return;

    setIsUploading(true);
    setError('');
    setShowPrompt(false);

    try {
      // Create a File object from the Blob
      const audioFile = new File([audioBlob], `${title.replace(/\s/g, '_')}.webm`, { type: 'audio/webm' });
      
      // Pass the recording time to the service
      const newRecording = await recordingService.uploadRecording(audioFile, title, recordingTime);
      onRecordingComplete(newRecording);
      resetRecorder();
    } catch (err) {
      console.error("Error uploading recording:", err);
      setError(`Lỗi tải lên: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecorder = () => {
    setIsRecording(false);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setError('');
    audioChunksRef.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="live-recorder">
      <h4>Ghi âm trực tiếp</h4>
      {error && <div className="error-message">{error}</div>}
      
      <div className="recorder-controls">
        {!isRecording && !audioUrl && (
          <button onClick={startRecording} className="record-btn start">
            <BsRecordCircle /> Bắt đầu ghi
          </button>
        )}

        {isRecording && (
          <button onClick={stopRecording} className="record-btn stop">
            <BsStopFill /> Dừng ghi ({formatTime(recordingTime)})
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="playback-controls">
          <audio src={audioUrl} controls />
          <div className="playback-actions">
            <button onClick={() => setShowPrompt(true)} disabled={isUploading} className="upload-btn">
              {isUploading ? 'Đang tải lên...' : 'Tải lên & Lưu'}
            </button>
            <button onClick={resetRecorder} className="delete-btn">
              <BsTrash /> Hủy bỏ
            </button>
          </div>
        </div>
      )}

      <PromptModal
        isOpen={showPrompt}
        onClose={() => setShowPrompt(false)}
        onSubmit={handleUpload}
        title="Lưu bản ghi âm"
        message="Vui lòng nhập tiêu đề cho bản ghi âm của bạn."
        defaultValue={`Bản ghi âm lúc ${new Date().toLocaleString('vi-VN')}`}
      />
    </div>
  );
};

export default LiveRecorder;
