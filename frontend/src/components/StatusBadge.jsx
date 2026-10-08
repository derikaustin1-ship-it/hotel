import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ height: '220px', width: '100%', borderRadius: '0' }}></div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="skeleton" style={{ height: '24px', width: '70%' }}></div>
        <div className="skeleton" style={{ height: '16px', width: '90%' }}></div>
        <div className="skeleton" style={{ height: '16px', width: '40%' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <div className="skeleton" style={{ height: '28px', width: '35%' }}></div>
          <div className="skeleton" style={{ height: '36px', width: '45%' }}></div>
        </div>
      </div>
    </div>
  );
};

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div style={{
      padding: '30px',
      backgroundColor: '#fff1f2',
      border: '1px solid #fecdd3',
      borderRadius: 'var(--radius-lg)',
      textAlign: 'center',
      margin: '20px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '14px'
    }}>
      <p style={{ color: '#be123c', fontWeight: 600, fontSize: '1.05rem' }}>
        {message || 'Unable to load data. Please try again.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline-slate btn-sm">
          Try Again
        </button>
      )}
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toUpperCase();

  let className = 'badge-pending';
  if (s === 'CONFIRMED' || s === 'AVAILABLE' || s === 'SUCCESS') {
    className = 'badge-confirmed';
  } else if (s === 'CANCELLED' || s === 'MAINTENANCE' || s === 'FAILED') {
    className = 'badge-cancelled';
  } else if (s === 'COMPLETED') {
    className = 'badge-completed';
  }

  return <span className={`badge ${className}`}>{status}</span>;
};
