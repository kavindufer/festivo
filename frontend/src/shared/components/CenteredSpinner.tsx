import React from 'react';

export const CenteredSpinner: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '1rem',
      color: '#334155'
    }}
  >
    <div className="spinner" style={{ width: 48, height: 48, border: '4px solid #cbd5f5', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <span>{label}</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
  </div>
);
