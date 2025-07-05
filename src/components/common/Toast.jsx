import React from 'react';
import '../styles/Toast.css'

const Toast = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className={`custom-toast ${type}`}>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>✕</button>
    </div>
  );
};

export default Toast;
