import React from 'react';

const ShareToWorkspaceModalSimple = ({ show, onHide, itemType, itemId, itemTitle, onShared }) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Share {itemType}</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <p>Simple test modal for {itemTitle} (ID: {itemId})</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareToWorkspaceModalSimple;
