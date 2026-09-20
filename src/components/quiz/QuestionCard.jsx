import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { BookOpen, AlertCircle } from 'lucide-react';
import { OPTION_LABELS, OPTION_COLORS } from '../../config/constants';

export default function QuestionCard({
  question,
  currentIndex = 0,
  totalQuestions = 1,
  selectedAnswerIndex = null,
  onSelectAnswer = null,
  isRevealed = false,
  showExplanation = false,
}) {
  if (!question) return null;

  return (
    <Card
      style={{
        maxWidth: '980px',
        width: '100%',
        margin: '0 auto',
        padding: 'clamp(18px, 3.5vw, 32px) clamp(16px, 3.5vw, 28px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <Badge variant="navy" icon={BookOpen}>
          <span style={{ fontSize: 'clamp(12.5px, 2.2vw, 14.5px)' }}>
            {question.topic || 'Modelamiento'}
          </span>
        </Badge>
        <span
          style={{
            fontSize: 'clamp(13.5px, 2.5vw, 16px)',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
          }}
        >
          Pregunta {currentIndex + 1} de {totalQuestions}
        </span>
      </div>

      <h2
        style={{
          fontSize: 'clamp(19px, 3.8vw, 27px)',
          fontWeight: 800,
          color: 'var(--color-text-main)',
          marginBottom: '20px',
          lineHeight: 1.35,
        }}
      >
        {question.q}
      </h2>

      {question.diagramSnippet && (
        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: 'clamp(12px, 2.5vw, 16px) clamp(14px, 3vw, 20px)',
            marginBottom: '20px',
            fontFamily: 'Consolas, monospace',
            fontSize: 'clamp(12.5px, 2.5vw, 14.5px)',
            color: 'var(--color-primary)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.45,
            overflowX: 'auto',
          }}
        >
          <code>{question.diagramSnippet}</code>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {question.opts.map((optionText, idx) => {
          const label = OPTION_LABELS[idx] || String(idx + 1);
          const isSelected = selectedAnswerIndex === idx;
          const isCorrect = isRevealed && idx === question.ans;
          const isWrongSelection = isRevealed && isSelected && !isCorrect;

          let btnBg = 'var(--color-surface)';
          let borderColor = 'var(--color-border)';
          let textColor = 'var(--color-text-main)';

          if (isRevealed) {
            if (isCorrect) {
              btnBg = 'var(--color-success-bg)';
              borderColor = 'var(--color-success)';
              textColor = '#15803D';
            } else if (isWrongSelection) {
              btnBg = 'var(--color-danger-bg)';
              borderColor = 'var(--color-danger)';
              textColor = '#B91C1C';
            } else {
              btnBg = 'var(--color-bg)';
              borderColor = 'var(--color-border)';
              textColor = 'var(--color-text-muted)';
            }
          } else if (isSelected) {
            btnBg = '#EFF6FF';
            borderColor = '#2563EB';
            textColor = '#1D4ED8';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectAnswer && !isRevealed && onSelectAnswer(idx)}
              disabled={isRevealed || !onSelectAnswer}
              className="touch-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(12px, 2.5vw, 18px)',
                padding: 'clamp(12px, 2.5vw, 18px) clamp(14px, 3vw, 22px)',
                borderRadius: '12px',
                backgroundColor: btnBg,
                border: `2px solid ${borderColor}`,
                color: textColor,
                textAlign: 'left',
                cursor: isRevealed || !onSelectAnswer ? 'default' : 'pointer',
                boxShadow: isSelected ? '0 0 0 1px #2563EB' : 'none',
                width: '100%',
              }}
            >
              <span
                style={{
                  width: 'clamp(34px, 5.5vw, 42px)',
                  height: 'clamp(34px, 5.5vw, 42px)',
                  borderRadius: '8px',
                  backgroundColor: OPTION_COLORS[label] || '#475569',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 'clamp(16px, 3vw, 20px)',
                  flexShrink: 0,
                  fontFamily: 'Consolas, monospace',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 'clamp(15px, 2.6vw, 19px)',
                  fontWeight: 600,
                  flex: 1,
                  lineHeight: 1.45,
                }}
              >
                {optionText}
              </span>
            </button>
          );
        })}
      </div>

      {showExplanation && question.exp && (
        <div
          style={{
            marginTop: '22px',
            padding: 'clamp(14px, 3vw, 20px) clamp(16px, 3.5vw, 24px)',
            backgroundColor: '#F0FDF4',
            border: '2px solid #BBF7D0',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#15803D',
              fontWeight: 800,
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              marginBottom: '8px',
            }}
          >
            <AlertCircle size={20} />
            <span>Fundamento Tecnico</span>
          </div>
          <p
            style={{
              fontSize: 'clamp(14.5px, 2.4vw, 17px)',
              color: '#166534',
              lineHeight: 1.55,
              fontWeight: 500,
            }}
          >
            {question.exp}
          </p>
        </div>
      )}
    </Card>
  );
}
