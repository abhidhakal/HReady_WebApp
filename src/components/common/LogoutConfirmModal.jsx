import React from 'react';
import './LogoutConfirmModal.css';

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <div className="logout-modal-header">
          <i className="fas fa-sign-out-alt"></i>
          <h3>Confirm Logout</h3>
        </div>
        <div className="logout-modal-body">
          <p>Are you sure you want to log out?</p>
          <p className="logout-warning">
            <i className="fas fa-exclamation-triangle"></i>
            This will end your current session and invalidate your token.
          </p>
        </div>
        <div className="logout-modal-footer">
          <button 
            className="logout-cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="logout-confirm-btn"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal; 