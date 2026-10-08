import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
        color: 'var(--slate-600)'
      }}>
        <Loader2 className="animate-spin" size={42} color="var(--primary-gold)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: 500, fontSize: '1.05rem' }}>{message}</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px',
      gap: '12px',
      color: 'var(--slate-600)'
    }}>
      <Loader2 size={24} color="var(--primary-gold)" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
