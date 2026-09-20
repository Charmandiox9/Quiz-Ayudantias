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
    <Card style={{ maxWidth: '980px', width: '100%', margin: '0 auto', padding: '28px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <Badge variant="navy" icon={BookOpen}>
          <span style={{ fontSize: '15px' }}>{question.topic || 'Modelamiento UML'}</span>
        </Badge>
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
          Pregunta {currentIndex + 1} de {totalQuestions}
        </span>
      </div>

      <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '22px', lineHeight: 1.35 }}>
        {question.q}
      </h2>

      {question.diagramSnippet && (
        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '22px',
            fontFamily: 'Consolas, monospace',
            fontSize: '15px',
            color: 'var(--color-primary)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.5,
          }}
        >
          {question.diagramSnippet}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                padding: '18px 22px',
                borderRadius: '12px',
                backgroundColor: btnBg,
                border: `2px solid ${borderColor}`,
                color: textColor,
                textAlign: 'left',
                cursor: isRevealed || !onSelectAnswer ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: OPTION_COLORS[label] || '#475569',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '20px',
                  flexShrink: 0,
                  fontFamily: 'Consolas, monospace',
                }}
              >
                {label}
              </span>
              <span style={{ fontSize: '20px', fontWeight: 600, flex: 1, lineHeight: 1.4 }}>
                {optionText}
              </span>
            </button>
          );
        })}
      </div>

      {showExplanation && question.exp && (
        <div
          style={{
            marginTop: '26px',
            padding: '20px 24px',
            backgroundColor: '#F0FDF4',
            border: '2px solid #BBF7D0',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>
            <AlertCircle size={20} />
            <span>Fundamento Tecnico</span>
          </div>
          <p style={{ fontSize: '17px', color: '#166534', lineHeight: 1.6, fontWeight: 500 }}>
            {question.exp}
          </p>
        </div>
      )}
    </Card>
  );
}
