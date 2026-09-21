import React from 'react';
import { OPTION_LABELS, OPTION_COLORS } from '../../config/constants';
import { Check } from 'lucide-react';

export default function VoteBars({
  votes = {},
  totalVotes = 0,
  correctAnswerIndex = null,
  isRevealed = false,
  optionsCount = 4,
}) {
  const labels = OPTION_LABELS.slice(0, optionsCount);
  const correctIndices = Array.isArray(correctAnswerIndex)
    ? correctAnswerIndex
    : correctAnswerIndex === null || correctAnswerIndex === undefined
      ? []
      : [correctAnswerIndex];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${labels.length}, 1fr)`,
        gap: 'clamp(8px, 2vw, 16px)',
        alignItems: 'flex-end',
        width: '100%',
        maxWidth: '980px',
        margin: '0 auto',
        padding: '16px 0',
      }}
    >
      {labels.map((label, index) => {
        const count = votes[label] || 0;
        const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        const isCorrect = isRevealed && correctIndices.includes(index);
        const baseColor = OPTION_COLORS[label] || '#475569';
        const displayColor = isCorrect ? 'var(--color-success)' : baseColor;

        return (
          <div
            key={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontFamily: 'Consolas, monospace',
                fontSize: 'clamp(15px, 2.5vw, 18px)',
                fontWeight: 800,
                color: isRevealed && !isCorrect ? 'var(--color-text-muted)' : displayColor,
              }}
            >
              {count}
            </span>

            <div
              style={{
                width: '100%',
                height: 'clamp(90px, 16vh, 140px)',
                backgroundColor: 'var(--color-surface-muted)',
                borderRadius: '10px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${Math.max(percentage, count > 0 ? 6 : 0)}%`,
                  backgroundColor: displayColor,
                  borderRadius: '8px 8px 0 0',
                  opacity: isRevealed && !isCorrect ? 0.35 : 1,
                  transition: 'height 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease',
                }}
              />
            </div>

            <div
              style={{
                width: 'clamp(38px, 6vw, 48px)',
                height: 'clamp(38px, 6vw, 48px)',
                borderRadius: '10px',
                backgroundColor: isCorrect ? 'var(--color-success-bg)' : 'var(--color-surface)',
                border: `3px solid ${displayColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 'clamp(16px, 3vw, 20px)',
                fontFamily: 'Consolas, monospace',
                color: displayColor,
                opacity: isRevealed && !isCorrect ? 0.5 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              {isCorrect ? <Check size={24} strokeWidth={3.5} /> : label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
