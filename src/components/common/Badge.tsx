import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type BadgeVariant = 'neutral' | 'navy' | 'amber' | 'success' | 'danger';
interface BadgeProps { children: ReactNode; variant?: BadgeVariant; icon?: LucideIcon | null; style?: CSSProperties }

export default function Badge({
  children,
  variant = 'neutral',
  icon: Icon = null,
  style = {},
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
    neutral: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
    navy: { bg: '#EEF2FF', text: '#1E2761', border: '#C7D2FE' },
    amber: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
    success: { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
    danger: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
  };

  const conf = variantStyles[variant] || variantStyles.neutral;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: conf.bg,
    color: conf.text,
    border: `1px solid ${conf.border}`,
    ...style,
  };

  return (
    <span style={badgeStyle}>
      {Icon && <Icon size={14} />}
      <span>{children}</span>
    </span>
  );
}
