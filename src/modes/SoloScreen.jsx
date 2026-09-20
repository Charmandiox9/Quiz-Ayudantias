import React, { useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import QuestionCard from "../components/quiz/QuestionCard";
import {
  ArrowRight,
  RotateCcw,
  ArrowLeft,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
} from "lucide-react";

export default function SoloScreen({ ayudantia, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [answersHistory, setAnswersHistory] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = ayudantia.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectAnswer = (index) => {
    if (isAnswerRevealed) return;
    setSelectedOptionIndex(index);
    setIsAnswerRevealed(true);

    const isCorrect = index === currentQuestion.ans;
    if (isCorrect) {
      setScore((prev) => prev + (ayudantia.pointsPerQuestion || 1000));
      setCorrectAnswersCount((prev) => prev + 1);
    }

    setAnswersHistory((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        questionIndex: currentIndex,
        question: currentQuestion,
        selectedOption: index,
        correctOption: currentQuestion.ans,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setIsCompleted(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedOptionIndex(null);
    setIsAnswerRevealed(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setCorrectAnswersCount(0);
    setAnswersHistory([]);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const accuracy = Math.round((correctAnswersCount / questions.length) * 100);
    const incorrectAnswers = answersHistory.filter((item) => !item.isCorrect);
    const topicsToReview = Array.from(
      new Set(incorrectAnswers.map((item) => item.question.topic).filter(Boolean))
    );
    const optionLabels = ["A", "B", "C", "D"];

    return (
      <div style={{ maxWidth: "780px", margin: "32px auto", padding: "0 16px" }}>
        {/* Resumen General */}
        <Card style={{ textAlign: "center", padding: "36px 24px", marginBottom: "24px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Trophy size={36} color="#D97706" />
          </div>

          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#1E2761", marginBottom: "6px" }}>
            Practica Completada
          </h2>
          <p style={{ color: "#64748B", fontSize: "15px", marginBottom: "24px" }}>
            Has completado las {questions.length} preguntas de {ayudantia.title}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                padding: "14px",
                backgroundColor: "#F8FAFC",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748B", display: "block" }}>Aciertos</span>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#16A34A" }}>
                {correctAnswersCount} / {questions.length}
              </span>
            </div>
            <div
              style={{
                padding: "14px",
                backgroundColor: "#F8FAFC",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748B", display: "block" }}>Precision</span>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#1E2761" }}>
                {accuracy}%
              </span>
            </div>
            <div
              style={{
                padding: "14px",
                backgroundColor: "#F8FAFC",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748B", display: "block" }}>Puntaje</span>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#D97706" }}>
                {score}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Button variant="secondary" icon={RotateCcw} onClick={handleRestart}>
              Reintentar Quiz
            </Button>
            <Button variant="primary" icon={ArrowLeft} onClick={onExit}>
              Volver al Menu
            </Button>
          </div>
        </Card>

        {/* Diagnostico de Conceptos a Reforzar */}
        {incorrectAnswers.length === 0 ? (
          <Card
            style={{
              padding: "24px",
              backgroundColor: "#F0FDF4",
              border: "1.5px solid #86EFAC",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#DCFCE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={28} color="#16A34A" />
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#166534", margin: 0 }}>
                Dominio Completo de Conceptos
              </h3>
              <p style={{ fontSize: "14px", color: "#15803D", margin: "4px 0 0" }}>
                Respondiste correctamente todas las preguntas de la sesion. Tu comprension de los
                fundamentos teoricos y practicos es optima.
              </p>
            </div>
          </Card>
        ) : (
          <div style={{ marginBottom: "32px" }}>
            {/* Resumen de Conceptos a Reforzar */}
            <Card
              style={{
                padding: "20px 24px",
                backgroundColor: "#FFFBEB",
                border: "1.5px solid #FDE68A",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <AlertTriangle size={20} color="#D97706" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#92400E", margin: 0 }}>
                  Conceptos clave a reforzar ({topicsToReview.length} temas detectados)
                </h3>
              </div>
              <p style={{ fontSize: "13.5px", color: "#78350F", margin: "0 0 14px", lineHeight: 1.5 }}>
                Tuviste errores en las siguientes areas tematicas. Te recomendamos repasar estos
                conceptos y sus analogias en el material de la ayudantia:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {topicsToReview.map((topic, idx) => (
                  <Badge key={idx} variant="navy">
                    {topic}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Lista detallada de preguntas erradas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
                <BookOpen size={18} color="#1E2761" />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1E2761", margin: 0 }}>
                  Revision de preguntas para practicar ({incorrectAnswers.length})
                </h3>
              </div>

              {incorrectAnswers.map((item, idx) => {
                const q = item.question;
                const userOptIndex = item.selectedOption;
                const correctOptIndex = item.correctOption;

                return (
                  <Card key={idx} style={{ padding: "20px", borderLeft: "4px solid #EF4444" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748B" }}>
                          Pregunta {item.questionIndex + 1} de {questions.length}
                        </span>
                        <Badge variant="neutral">{q.topic}</Badge>
                      </div>
                      <Badge variant="danger">Incorrecta</Badge>
                    </div>

                    <h4
                      style={{
                        fontSize: "15.5px",
                        fontWeight: 700,
                        color: "#0F172A",
                        marginBottom: q.diagramSnippet ? "10px" : "14px",
                        lineHeight: 1.45,
                      }}
                    >
                      {q.q}
                    </h4>

                    {q.diagramSnippet && (
                      <pre
                        style={{
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          fontSize: "13px",
                          fontFamily: "Consolas, monospace",
                          color: "#1E2761",
                          marginBottom: "14px",
                          overflowX: "auto",
                        }}
                      >
                        <code>{q.diagramSnippet}</code>
                      </pre>
                    )}

                    {/* Comparativa de Respuestas */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                        gap: "10px",
                        marginBottom: "14px",
                      }}
                    >
                      {/* Tu seleccion */}
                      <div
                        style={{
                          padding: "10px 12px",
                          backgroundColor: "#FEF2F2",
                          border: "1px solid #FECACA",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "4px",
                          }}
                        >
                          <XCircle size={15} color="#DC2626" />
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#991B1B" }}>
                            Tu respuesta ({optionLabels[userOptIndex]}):
                          </span>
                        </div>
                        <p style={{ fontSize: "13px", color: "#7F1D1D", margin: 0, lineHeight: 1.4 }}>
                          {q.opts[userOptIndex]}
                        </p>
                      </div>

                      {/* Respuesta Correcta */}
                      <div
                        style={{
                          padding: "10px 12px",
                          backgroundColor: "#F0FDF4",
                          border: "1px solid #BBF7D0",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "4px",
                          }}
                        >
                          <CheckCircle2 size={15} color="#16A34A" />
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>
                            Respuesta correcta ({optionLabels[correctOptIndex]}):
                          </span>
                        </div>
                        <p style={{ fontSize: "13px", color: "#14532D", margin: 0, lineHeight: 1.4 }}>
                          {q.opts[correctOptIndex]}
                        </p>
                      </div>
                    </div>

                    {/* Explicacion Pedagogica */}
                    <div
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "#F1F5F9",
                        borderLeft: "3px solid #1E2761",
                        borderRadius: "4px",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          color: "#475569",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "3px",
                        }}
                      >
                        Por que es correcta esta opcion:
                      </span>
                      <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: 1.45 }}>
                        {q.exp}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "820px", margin: "24px auto", padding: "0 16px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onExit}>
          Menu
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Badge variant="amber">Puntaje: {score} pts</Badge>
          <Badge variant="navy">Aciertos: {correctAnswersCount}</Badge>
        </div>
      </header>

      <QuestionCard
        question={currentQuestion}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        selectedAnswerIndex={selectedOptionIndex}
        onSelectAnswer={handleSelectAnswer}
        isRevealed={isAnswerRevealed}
        showExplanation={isAnswerRevealed}
      />

      {isAnswerRevealed && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" size="lg" icon={ArrowRight} onClick={handleNext}>
            {isLastQuestion ? "Ver Resultados Finales" : "Siguiente Pregunta"}
          </Button>
        </div>
      )}
    </div>
  );
}
