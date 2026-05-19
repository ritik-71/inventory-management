import React from 'react';

export const Skeleton: React.FC<{ className?: string, width?: string, height?: string, style?: React.CSSProperties }> = ({ className, width, height, style }) => {
  return (
    <div 
      className={`skeleton ${className || ''}`} 
      style={{ 
        width: width || '100%', 
        height: height || '20px', 
        backgroundColor: '#e2e8f0',
        borderRadius: 'var(--radius)',
        animation: 'pulse 1.5s infinite ease-in-out',
        ...style 
      }} 
    />
  );
};
