import React from 'react';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon | null;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon: Icon = null,
  type = 'button',
  className = '',
  style = {},
  title,
}: ButtonProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const sizeStyles = {
    sm: { padding: '8px 14px', fontSize: '13px' },
    md: { padding: '12px 20px', fontSize: '15px' },
    lg: { padding: '16px 28px', fontSize: '17px' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#1E2761',
      color: '#FFFFFF',
    },
    accent: {
      backgroundColor: '#D97706',
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: '#F1F5F9',
      color: '#0F172A',
      border: '1px solid #CBD5E1',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#1E2761',
      border: '2px solid #1E2761',
    },
    danger: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...(sizeStyles[size] || sizeStyles.md),
    ...(variantStyles[variant] || variantStyles.primary),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={combinedStyles}
      className={className}
      title={title}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
      <span>{children}</span>
    </button>
  );
}
