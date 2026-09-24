import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import type { PlayerScore } from '../../types';

export default function Leaderboard({ players = [], maxEntries = 8 }: { players?: PlayerScore[]; maxEntries?: number }) {
  const sortedPlayers = [...players]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, maxEntries);

  const getRankBadge = (rank: number) => {
    if (rank === 0) return <Trophy size={26} color="#D97706" />;
    if (rank === 1) return <Medal size={24} color="#64748B" />;
    if (rank === 2) return <Award size={24} color="#B45309" />;
    return <span style={{ fontWeight: 800, color: '#94A3B8', fontSize: 'clamp(16px, 2.5vw, 20px)' }}>{rank + 1}</span>;
  };

  const getCardStyle = (rank: number) => {
    const isTopThree = rank < 3;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(10px, 2.5vw, 18px)',
      padding: rank === 0 ? 'clamp(14px, 2.5vw, 18px) clamp(16px, 3vw, 24px)' : 'clamp(10px, 2vw, 14px) clamp(12px, 2.5vw, 20px)',
      borderRadius: '12px',
      backgroundColor: isTopThree ? 'var(--color-surface)' : 'var(--color-bg)',
      border: isTopThree
        ? rank === 0
          ? '3px solid #FCD34D'
          : rank === 1
          ? '2px solid #CBD5E1'
          : '2px solid #FDBA74'
        : '1px solid var(--color-border)',
      boxShadow: rank === 0 ? '0 6px 16px -2px rgb(217 119 6 / 0.18)' : 'none',
      transform: rank === 0 ? 'scale(1.01)' : 'none',
      transition: 'all 0.3s ease',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '760px', margin: '0 auto' }}>
      {sortedPlayers.map((player, index) => (
        <div key={player.id || index} style={getCardStyle(index)}>
          <div style={{ width: 'clamp(32px, 5vw, 40px)', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            {getRankBadge(index)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontWeight: 800,
                color: 'var(--color-text-main)',
                fontSize: index === 0 ? 'clamp(17px, 3vw, 22px)' : 'clamp(15px, 2.5vw, 19px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {player.name || 'Estudiante'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexShrink: 0 }}>
            <span
              style={{
                fontFamily: 'Consolas, monospace',
                fontWeight: 900,
                fontSize: index === 0 ? 'clamp(20px, 3.5vw, 26px)' : 'clamp(17px, 3vw, 22px)',
                color: index === 0 ? 'var(--color-accent)' : 'var(--color-primary)',
              }}
            >
              {player.score || 0}
            </span>
            <span style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              pts
            </span>
          </div>
        </div>
      ))}

      {sortedPlayers.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '16px', padding: '32px 0' }}>
          Esperando participantes...
        </p>
      )}
    </div>
  );
}
