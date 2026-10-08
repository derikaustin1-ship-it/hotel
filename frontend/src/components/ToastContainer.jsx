import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          <div style={{ flexShrink: 0 }}>
            {toast.type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
            {toast.type === 'error' && <AlertCircle size={20} color="#f43f5e" />}
            {toast.type === 'warning' && <AlertTriangle size={20} color="#f59e0b" />}
            {toast.type === 'info' && <Info size={20} color="#38bdf8" />}
          </div>
          <div style={{ flex: 1 }}>{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
