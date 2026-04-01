import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, duration = 2800, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast show">
      {message}
    </div>
  );
};

export default Toast;
