import React, { useState } from "react";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  XCircle,
  CheckCircle2,
} from "lucide-react";

export default function MistakesCarousel({ mistakes = [], totalQuestions = 16 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mistakes || mistakes.length === 0) {
    return null;
  }

  const safeIndex = Math.min(Math.max(currentIndex, 0), mistakes.length - 1);
  const currentItem = mistakes[safeIndex];
  const q = currentItem.question;
  const userOptIndex = currentItem.selectedOption;
  const correctOptIndex = currentItem.correctOption;
  const optionLabels = ["A", "B", "C", "D"];

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  const handleNext = () => {
    if (safeIndex < mistakes.length - 1) {
      setCurrentIndex(safeIndex + 1);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Barra de Navegación del Carrusel */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          padding: "8px 4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={18} color="var(--color-primary)" />
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-primary)" }}>
            Revision de errores ({safeIndex + 1} de {mistakes.length})
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            variant="secondary"
            size="sm"
            icon={ChevronLeft}
            onClick={handlePrev}
            disabled={safeIndex === 0}
            className="touch-btn"
          >
            Anterior
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={ChevronRight}
            onClick={handleNext}
            disabled={safeIndex === mistakes.length - 1}
            className="touch-btn"
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Tarjeta de la Pregunta Actual (Slide) */}
      <Card
        key={safeIndex}
        className="fade-in"
        style={{
          padding: "clamp(18px, 3.5vw, 28px)",
          borderLeft: "5px solid var(--color-danger)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--color-text-secondary)" }}>
              Pregunta {currentItem.questionIndex + 1} de {totalQuestions}
            </span>
            <Badge variant="navy">{q.topic}</Badge>
          </div>
          <Badge variant="danger">
            Error {safeIndex + 1} de {mistakes.length}
          </Badge>
        </div>

        <h3
          style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            fontWeight: 800,
            color: "var(--color-text-main)",
            marginBottom: q.diagramSnippet ? "12px" : "16px",
            lineHeight: 1.4,
          }}
        >
          {q.q}
        </h3>

        {q.diagramSnippet && (
          <div
            style={{
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              fontFamily: "Consolas, monospace",
              color: "var(--color-primary)",
              marginBottom: "16px",
              overflowX: "auto",
            }}
          >
            <code>{q.diagramSnippet}</code>
          </div>
        )}

        {/* Comparativa: Tu Respuesta vs Respuesta Correcta */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {/* Tu selección (Errada) */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "6px",
              }}
            >
              <XCircle size={16} color="var(--color-danger)" />
              <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#991B1B" }}>
                Tu respuesta ({optionLabels[userOptIndex]}):
              </span>
            </div>
            <p style={{ fontSize: "13.5px", color: "#7F1D1D", margin: 0, lineHeight: 1.45 }}>
              {q.opts[userOptIndex]}
            </p>
          </div>

          {/* Respuesta Correcta */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "var(--color-success-bg)",
              border: "1px solid var(--color-success-border)",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "6px",
              }}
            >
              <CheckCircle2 size={16} color="var(--color-success)" />
              <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#166534" }}>
                Respuesta correcta ({optionLabels[correctOptIndex]}):
              </span>
            </div>
            <p style={{ fontSize: "13.5px", color: "#14532D", margin: 0, lineHeight: 1.45 }}>
              {q.opts[correctOptIndex]}
            </p>
          </div>
        </div>

        {/* Explicación Pedagógica */}
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "var(--color-surface-muted)",
            borderLeft: "4px solid var(--color-primary)",
            borderRadius: "6px",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "11.5px",
              fontWeight: 800,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "4px",
            }}
          >
            Fundamento teorico y explicacion:
          </span>
          <p style={{ fontSize: "13.5px", color: "var(--color-text-main)", margin: 0, lineHeight: 1.5 }}>
            {q.exp}
          </p>
        </div>
      </Card>

      {/* Paginador rápido / Selector de puntos */}
      {mistakes.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            padding: "8px 0",
          }}
        >
          {mistakes.map((_, idx) => {
            const isActive = idx === safeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className="touch-btn"
                style={{
                  width: isActive ? "32px" : "28px",
                  height: "28px",
                  borderRadius: "14px",
                  border: isActive ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                  backgroundColor: isActive ? "var(--color-primary)" : "var(--color-surface)",
                  color: isActive ? "#FFFFFF" : "var(--color-text-secondary)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                title={`Ir a pregunta errada ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
