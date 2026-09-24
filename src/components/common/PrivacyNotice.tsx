import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { PRIVACY_POLICY } from '../../config/privacyPolicy';
import type { CSSProperties } from 'react';

export default function PrivacyNotice({ compact = false }: { compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const containerStyle = {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: compact ? '10px 14px' : '14px 18px',
    fontSize: '13px',
    color: '#475569',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const titleGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#1E2761',
    fontWeight: 600,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle} onClick={() => setExpanded(!expanded)}>
        <div style={titleGroupStyle}>
          <ShieldCheck size={18} color="#16A34A" />
          <span>Proteccion de Datos Personales (Ley N° 21.719)</span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      <p style={{ marginTop: '6px', fontSize: '12px', color: '#64748B' }}>
        {PRIVACY_POLICY.legalNotice}
      </p>

      {expanded && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {PRIVACY_POLICY.principles.map((p, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0F172A', fontSize: '12px', marginBottom: '4px' }}>
                  <Lock size={12} color="#D97706" />
                  <span>{p.title}</span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.4 }}>
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
