import React, { useEffect } from 'react';
import '../styles/Toast.css';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const getIconSrc = () => {
    switch (type) {
      case 'success':
        return '/assets/icons/check.svg';
      case 'error':
        return '/assets/icons/cross.svg';
      default:
        return '/assets/icons/dash.svg';
    }
  };

  return (
    <div className={`custom-toast ${type}`}>
      <div className="toast-content">
        <img
          src={getIconSrc()}
          alt={`${type} icon`}
          className="toast-icon"
        />
        <span>{message}</span>
      </div>
      <button className="close-btn" onClick={onClose}>✕</button>
    </div>
  );
};

export default Toast;
