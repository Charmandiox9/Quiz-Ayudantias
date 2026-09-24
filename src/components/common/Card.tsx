import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
  className?: string;
  id?: string;
}

export default function Card({
  children,
  title = null,
  subtitle = null,
  headerAction = null,
  footer = null,
  style = {},
  className = '',
  id,
}: CardProps) {
  const containerStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
    overflow: 'hidden',
    ...style,
  };

  const headerStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  };

  const bodyStyle = {
    padding: '20px',
  };

  const footerStyle = {
    padding: '12px 20px',
    backgroundColor: '#F8FAFC',
    borderTop: '1px solid #F1F5F9',
  };

  return (
    <div id={id} style={containerStyle} className={className}>
      {(title || subtitle || headerAction) && (
        <div style={headerStyle}>
          <div>
            {title && (
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div style={bodyStyle}>{children}</div>
      {footer && <div style={footerStyle}>{footer}</div>}
    </div>
  );
}
