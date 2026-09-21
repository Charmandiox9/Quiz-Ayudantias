import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { BookOpen, AlertCircle, Check } from 'lucide-react';
import { OPTION_LABELS, OPTION_COLORS } from '../../config/constants';
import { formatAnswerText, getAnswerIndices, isAnswerCorrect, isMultipleSelect, isOrdering, isShortAnswer } from '../../utils/answers';

export default function QuestionCard({
  question,
  currentIndex = 0,
  totalQuestions = 1,
  selectedAnswerIndex = null,
  onSelectAnswer = null,
  onReorderAnswer = null,
  onSubmitAnswer = null,
  isRevealed = false,
  showExplanation = false,
}) {
  if (!question) return null;
  const selectedIndices = Array.isArray(selectedAnswerIndex)
    ? selectedAnswerIndex
    : selectedAnswerIndex === null || selectedAnswerIndex === undefined
      ? []
      : [selectedAnswerIndex];
  const correctIndices = getAnswerIndices(question.ans);
  const multipleSelect = isMultipleSelect(question);
  const ordering = isOrdering(question);
  const shortAnswer = isShortAnswer(question);
  const orderingIndices = Array.isArray(selectedAnswerIndex)
    ? selectedAnswerIndex
    : ordering && !onReorderAnswer ? (question.opts || []).map((_, index) => index) : [];

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
          marginBottom: multipleSelect || ordering || shortAnswer ? '14px' : '20px',
          lineHeight: 1.35,
        }}
      >
        {question.q}
      </h2>

      {question.image && (
        <img
          src={question.image}
          alt="Imagen de apoyo para la pregunta"
          style={{ display: 'block', maxWidth: '100%', maxHeight: 420, objectFit: 'contain', margin: '0 auto 20px', borderRadius: 12, border: '1px solid var(--color-border)' }}
        />
      )}

      {multipleSelect && (
        <p style={{ margin: '0 0 14px', color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 600 }}>
          Selecciona todas las alternativas correctas.
        </p>
      )}

      {ordering && !onReorderAnswer && !isRevealed && (
        <p style={{ margin: '0 0 14px', color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 600 }}>
          Ordena los elementos desde tu dispositivo.
        </p>
      )}
      {ordering && !onReorderAnswer && isRevealed && (
        <p style={{ margin: '0 0 14px', color: '#166534', fontWeight: 800 }}>Orden correcto: {formatAnswerText(question, question.ans)}</p>
      )}

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

      {shortAnswer && (
        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          <label htmlFor="short-answer-response" style={{ color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: 14 }}>Tu respuesta</label>
          <input
            id="short-answer-response"
            value={typeof selectedAnswerIndex === 'string' ? selectedAnswerIndex : ''}
            onChange={(event) => onSelectAnswer && onSelectAnswer(event.target.value)}
            disabled={isRevealed || !onSelectAnswer}
            maxLength={240}
            placeholder="Escribe una respuesta breve"
            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--color-border)', borderRadius: 10, padding: '13px 15px', font: 'inherit' }}
          />
          {isRevealed && (
            <p style={{ margin: 0, color: '#166534', fontWeight: 700 }}>Respuestas aceptadas: {formatAnswerText(question, question.ans)}</p>
          )}
          {onSubmitAnswer && !isRevealed && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" icon={Check} onClick={onSubmitAnswer} disabled={!String(selectedAnswerIndex || '').trim()}>Enviar respuesta</Button>
            </div>
          )}
        </div>
      )}

      {ordering && onReorderAnswer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 16 }}>
          {orderingIndices.map((optionIndex, position) => (
            <div key={`${optionIndex}-${position}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', border: '1px solid var(--color-border)', borderRadius: 10, background: isRevealed && correctIndices[position] === optionIndex ? 'var(--color-success-bg)' : 'var(--color-surface)' }}>
              <span style={{ minWidth: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', background: '#EEF2FF', color: 'var(--color-primary)', fontWeight: 800 }}>{position + 1}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{question.opts[optionIndex]}</span>
              {!isRevealed && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button type="button" aria-label={`Subir ${question.opts[optionIndex]}`} disabled={position === 0} onClick={() => onReorderAnswer(moveItem(orderingIndices, position, -1))} style={reorderButtonStyle}>↑</button>
                  <button type="button" aria-label={`Bajar ${question.opts[optionIndex]}`} disabled={position === orderingIndices.length - 1} onClick={() => onReorderAnswer(moveItem(orderingIndices, position, 1))} style={reorderButtonStyle}>↓</button>
                </div>
              )}
            </div>
          ))}
          {isRevealed && !isAnswerCorrect(question, orderingIndices) && (
            <p style={{ margin: '4px 0 0', color: '#166534', fontWeight: 700 }}>Orden correcto: {formatAnswerText(question, question.ans)}</p>
          )}
          {onSubmitAnswer && !isRevealed && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
              <Button variant="primary" icon={Check} onClick={onSubmitAnswer} disabled={orderingIndices.length < 2}>Confirmar orden</Button>
            </div>
          )}
        </div>
      )}

      {!shortAnswer && !ordering && <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {(question.opts || []).map((optionText, idx) => {
          const label = OPTION_LABELS[idx] || String(idx + 1);
          const isSelected = selectedIndices.includes(idx);
          const isCorrect = isRevealed && correctIndices.includes(idx);
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
      </div>}

      {multipleSelect && onSubmitAnswer && !isRevealed && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button
            variant="primary"
            icon={Check}
            onClick={onSubmitAnswer}
            disabled={selectedIndices.length === 0}
          >
            Confirmar respuesta
          </Button>
        </div>
      )}

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

const reorderButtonStyle = {
  width: 32,
  height: 32,
  border: '1px solid var(--color-border)',
  borderRadius: 7,
  background: '#FFFFFF',
  color: 'var(--color-primary)',
  fontWeight: 800,
  cursor: 'pointer',
};

function moveItem(items, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
