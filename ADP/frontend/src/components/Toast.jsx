import React, { useEffect } from 'react';

export default function Toast({ visible, icon = '✅', message, onClose }) {
  useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <div className={`toast ${visible ? '' : 'hidden'} animate-fadeIn`}>
      <span>{icon}</span>
      <span className="font-semibold tracking-wide text-xs text-slate-200">{message}</span>
    </div>
  );
}
