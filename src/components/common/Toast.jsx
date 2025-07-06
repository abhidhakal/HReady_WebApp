import React, { useEffect } from 'react';
import '../styles/Toast.css';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`custom-toast ${type}`}>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>✕</button>
    </div>
  );
};

export default Toast;
