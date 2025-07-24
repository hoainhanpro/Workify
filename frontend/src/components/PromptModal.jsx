import React, { useState, useEffect } from 'react';
import './PromptModal.css';

const PromptModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  defaultValue = '',
  submitText = 'Lưu',
  cancelText = 'Hủy'
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="prompt-modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="prompt-input"
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {cancelText}
            </button>
            <button type="submit" className="btn btn-primary">
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptModal;
