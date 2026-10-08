import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isDanger && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  color: '#dc2626'
                }}>
                  <AlertTriangle size={20} />
                </div>
              )}
              <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>{title}</h3>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--slate-400)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {message}
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '8px',
          }}>
            <button
              type="button"
              className="btn btn-outline-slate"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
