import React, { useEffect, useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import QuestionCard from "../components/quiz/QuestionCard";
import MistakesCarousel from "../components/quiz/MistakesCarousel";
import RewardCard from "../components/common/RewardCard";
import { isAnswerCorrect, isMultipleSelect, isOrdering, isShortAnswer, shuffleIndices } from "../utils/answers";
import {
  ArrowRight,
  RotateCcw,
  ArrowLeft,
  Trophy,
  AlertTriangle,
} from "lucide-react";

export default function SoloScreen({ ayudantia, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [orderingOrder, setOrderingOrder] = useState([]);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [answersHistory, setAnswersHistory] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = ayudantia.questions || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  useEffect(() => {
    setSelectedOptionIndex(null);
    setOrderingOrder(isOrdering(currentQuestion) ? shuffleIndices(currentQuestion.opts?.length || 0) : []);
  }, [currentQuestion]);

  const handleSubmitAnswer = (answer = isOrdering(currentQuestion) ? orderingOrder : selectedOptionIndex) => {
    if (isAnswerRevealed) return;
    setSelectedOptionIndex(answer);
    setIsAnswerRevealed(true);

    const isCorrect = isAnswerCorrect(currentQuestion, answer);
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
        selectedOption: answer,
        correctOption: currentQuestion.ans,
        isCorrect,
      },
    ]);
  };

  const handleSelectAnswer = (index) => {
    if (isAnswerRevealed) return;
    if (isShortAnswer(currentQuestion)) {
      setSelectedOptionIndex(index);
      return;
    }
    if (isOrdering(currentQuestion)) {
      setOrderingOrder(index);
      return;
    }
    if (isMultipleSelect(currentQuestion)) {
      setSelectedOptionIndex((previous) => {
        const selected = Array.isArray(previous) ? previous : [];
        return selected.includes(index)
          ? selected.filter((item) => item !== index)
          : [...selected, index].sort((a, b) => a - b);
      });
      return;
    }
    handleSubmitAnswer(index);
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
          <div style={{ marginBottom: "32px" }}>
            <RewardCard
              title={ayudantia.cardTitle || ayudantia.title}
              subtitle={ayudantia.cardSubtitle || `Carta de Logro Coleccionable — ${ayudantia.courseLabel || ayudantia.course || "Quiz Ayudantías"}`}
              courseLabel={ayudantia.courseLabel || ayudantia.course || "Quiz Ayudantías"}
              accuracy={100}
              score={score}
              mascotSrc={ayudantia.cardImage || "/assets/mascot.png"}
              sealLogoSrc={ayudantia.sealLogoUrl || "/assets/seal_logo.jpg"}
              onRestart={handleRestart}
              onExit={onExit}
            />
          </div>
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

            {/* Carrusel de Revisión Focalizada (Sin scroll infinito) */}
            <MistakesCarousel
              mistakes={incorrectAnswers}
              totalQuestions={questions.length}
            />
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
          flexWrap: "wrap",
          gap: "10px",
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
        selectedAnswerIndex={isOrdering(currentQuestion) ? orderingOrder : selectedOptionIndex}
        onSelectAnswer={handleSelectAnswer}
        onReorderAnswer={isOrdering(currentQuestion) ? setOrderingOrder : null}
        onSubmitAnswer={isMultipleSelect(currentQuestion) || isShortAnswer(currentQuestion) || isOrdering(currentQuestion)
          ? () => handleSubmitAnswer()
          : null}
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
