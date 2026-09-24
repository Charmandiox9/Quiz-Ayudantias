import React, { useState, useEffect, useRef } from "react";
import { RealtimeQuizService } from "../services/realtimeService";
import { audioService } from "../services/audioService";
import { GAME_PHASES } from "../config/constants";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import QRCodeDisplay from "../components/common/QRCodeDisplay";
import QuestionCard from "../components/quiz/QuestionCard";
import VoteBars from "../components/quiz/VoteBars";
import Leaderboard from "../components/quiz/Leaderboard";
import TimerRing from "../components/quiz/TimerRing";
import { answerLabels, formatAnswerText, isAnswerCorrect, isOrdering, isShortAnswer, responseToOptionIndices, shuffleIndices } from "../utils/answers";
import { getAppUrl } from "../utils/appUrl";
import { getQuestionTimeLimitSeconds } from "../utils/quizTime";
import type { GamePhase, LiveQuestionPayload, PlayerScore, QuizDefinition, QuizQuestion } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  Users,
  Trophy,
  Eye,
  QrCode,
  X,
  Copy,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";

function createLiveQuestionPayload(question: QuizQuestion, questionIndex: number, totalQuestions: number, optionOrder: number[] = []): LiveQuestionPayload {
  const resolvedOrder = optionOrder.length
    ? optionOrder
    : (question.opts || []).map((_, index) => index);
  return {
    questionIndex,
    totalQuestions,
    answerType: question.type || "single_choice",
    prompt: question.q || "",
    image: question.image || "",
    optionTexts: question.opts || [],
    optionOrder: resolvedOrder,
  };
}

function getQuestionOrder(question: QuizQuestion): number[] {
  const length = question.opts?.length || 0;
  return isOrdering(question) ? shuffleIndices(length) : Array.from({ length }, (_, index) => index);
}

export default function HostScreen({ ayudantia, roomCode, onExit }: { ayudantia: QuizDefinition; roomCode: string; onExit: () => void }) {
  const [phase, setPhase] = useState<GamePhase>(GAME_PHASES.LOBBY);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [responseCount, setResponseCount] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(getQuestionTimeLimitSeconds(ayudantia.questions[0], ayudantia.defaultTimerSeconds || 60));
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const serviceRef = useRef<RealtimeQuizService | null>(null);
  const playersRef = useRef<PlayerScore[]>([]);
  const currentQuestionRef = useRef<QuizQuestion>(ayudantia.questions[0]);
  const optionOrderRef = useRef<number[]>([]);
  const gameStateRef = useRef<{ phase: GamePhase; index: number }>({ phase: GAME_PHASES.LOBBY, index: 0 });
  const questionStartTimeRef = useRef(0);
  const answeredPlayersRef = useRef(new Set<string>());
  const questionEndedRef = useRef(false);

  const currentQuestion = ayudantia.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ayudantia.questions.length - 1;
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
    gameStateRef.current = { phase, index: currentQuestionIndex };
  }, [currentQuestion, phase, currentQuestionIndex]);

  const origin = getAppUrl();
  const joinUrl = `${origin}/?join=${roomCode}`;

  const handleToggleAudio = () => {
    const muted = audioService.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleExit = async () => {
    // Si el docente abandona antes de terminar, los jugadores no deben quedar
    // esperando en una sala que ya no tiene host.
    if (phase !== GAME_PHASES.FINISHED && serviceRef.current) {
      await serviceRef.current.broadcastRoomClosed({ reason: "host_left" });
    }
    onExit();
  };

  const handleTimeUp = () => {
    if (questionEndedRef.current) return;
    questionEndedRef.current = true;
    audioService.stopMusic();
    audioService.playTimeUp();
    setPhase(GAME_PHASES.VOTES);
    if (serviceRef.current) {
      serviceRef.current.broadcastState({
        phase: GAME_PHASES.VOTES,
        players: playersRef.current,
      });
    }
  };

  useEffect(() => {
    if (phase !== GAME_PHASES.QUESTION) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 6 && prev > 1) {
          audioService.playTick();
        }
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentQuestionIndex]);

  useEffect(() => {
    const service = new RealtimeQuizService(roomCode);
    serviceRef.current = service;

    service.subscribe({
      onConnected: () => {
        service.trackPresence({ role: "host", name: "Docente-Host" });
      },
      onPresenceSync: (activePresences) => {
        setPlayers((prev) => {
          const currentMap = new Map(prev.map((p) => [p.name.toLowerCase(), p]));
          let updated = false;

          for (const item of activePresences) {
            if (item.role === "host") continue;
            const lower = item.name.toLowerCase();
            const existing = currentMap.get(lower);

            if (!existing) {
              currentMap.set(lower, {
                id: item.id || Math.random().toString(36).substring(2, 9),
                name: item.name,
                score: item.score || 0,
                lastEarnedPoints: 0,
                correctAnswersCount: 0,
              });
              updated = true;
            } else if (item.id && existing.id !== item.id) {
              currentMap.set(lower, {
                ...existing,
                id: item.id,
              });
              updated = true;
            }
          }

          return updated ? Array.from(currentMap.values()) : prev;
        });
      },
      onPlayerJoin: (player) => {
        setPlayers((prev) => {
          const lower = player.name.toLowerCase();
          const existingIdx = prev.findIndex(
            (p) => p.name.toLowerCase() === lower || (player.id && p.id === player.id)
          );

          if (serviceRef.current) {
            const currentQ = currentQuestionRef.current;
            serviceRef.current.broadcastState({
              ...createLiveQuestionPayload(
                currentQ,
                gameStateRef.current.index,
                ayudantia.questions.length,
                optionOrderRef.current
              ),
              phase: gameStateRef.current.phase,
              correctAnswerIndex:
                gameStateRef.current.phase === GAME_PHASES.REVEAL ? currentQ.ans : null,
              players: playersRef.current,
            });
          }

          if (existingIdx >= 0) {
            const copy = [...prev];
            copy[existingIdx] = {
              ...copy[existingIdx],
              id: player.id || copy[existingIdx].id,
              name: player.name,
            };
            return copy;
          }

          return [
            ...prev,
            {
              id: player.id || Math.random().toString(36).substring(2, 9),
              name: player.name,
              score: 0,
              lastEarnedPoints: 0,
              correctAnswersCount: 0,
            },
          ];
        });
      },
      onPlayerVote: ({ playerName, optionLabel, answer, playerId }) => {
        if (gameStateRef.current.phase !== GAME_PHASES.QUESTION) return;
        const voterKey = playerId || String(playerName || "").toLowerCase();
        if (!voterKey || answeredPlayersRef.current.has(voterKey)) return;
        answeredPlayersRef.current.add(voterKey);
        const currentQ = currentQuestionRef.current;
        const response = answer ?? optionLabel;
        const selectedIndices = responseToOptionIndices(currentQ, response);
        const selectedLabels = answerLabels(selectedIndices);
        setResponseCount((prev) => prev + 1);
        if (!isShortAnswer(currentQ) && !isOrdering(currentQ)) {
          setVotes((prev) => selectedLabels.reduce(
            (next, label) => ({ ...next, [label]: (next[label] || 0) + 1 }),
            prev
          ));
        }

        const isCorrect = isAnswerCorrect(currentQ, response);

        let pointsEarned = 0;
        if (isCorrect) {
          const now = Date.now();
          const elapsedMs = Math.max(0, now - questionStartTimeRef.current);
          const totalMs = getQuestionTimeLimitSeconds(currentQ, ayudantia.defaultTimerSeconds || 60) * 1000;
          const remainingFraction = Math.max(0, Math.min(1, 1 - (elapsedMs / totalMs)));
          // Formula dinamica: 500 base + 500 proporcional al tiempo restante
          pointsEarned = Math.round(500 + 500 * remainingFraction);
        }

        const updated = playersRef.current.map((p) => {
            const isMatch = (playerId && p.id === playerId) || (p.name.toLowerCase() === playerName.toLowerCase());
            if (isMatch) {
              return {
                ...p,
                score: p.score + pointsEarned,
                lastEarnedPoints: pointsEarned,
                correctAnswersCount: (p.correctAnswersCount || 0) + (isCorrect ? 1 : 0),
                lastOption: isShortAnswer(currentQ)
                  ? String(response || "").slice(0, 100)
                  : isOrdering(currentQ)
                    ? formatAnswerText(currentQ, response)
                    : selectedLabels.join(", "),
              };
            }
            return p;
        });
        playersRef.current = updated;
        setPlayers(updated);

        // No hay razones para mantener el cronómetro abierto cuando todos los
        // participantes conectados ya respondieron esta pregunta.
        if (playersRef.current.length > 0 && answeredPlayersRef.current.size >= playersRef.current.length) {
          handleTimeUp();
        }
      },
    });

    return () => {
      audioService.cleanup();
      service.unsubscribe();
    };
  }, [roomCode, ayudantia.questions.length, ayudantia.defaultTimerSeconds]);

  const handleStartGame = () => {
    answeredPlayersRef.current.clear();
    questionEndedRef.current = false;
    setPlayers((previous) => {
      const reset = previous.map((player) => ({ ...player, score: 0, lastEarnedPoints: 0, correctAnswersCount: 0 }));
      playersRef.current = reset;
      return reset;
    });
    const optionOrder = getQuestionOrder(currentQuestion);
    optionOrderRef.current = optionOrder;
    setCurrentQuestionIndex(0);
    setVotes({});
    setResponseCount(0);
    setRemainingSeconds(getQuestionTimeLimitSeconds(currentQuestion, ayudantia.defaultTimerSeconds || 60));
    setPhase(GAME_PHASES.QUESTION);
    questionStartTimeRef.current = Date.now();
    audioService.startQuestionMusic();

    if (serviceRef.current) {
      serviceRef.current.broadcastNext({
        timerSeconds: getQuestionTimeLimitSeconds(currentQuestion, ayudantia.defaultTimerSeconds || 60),
        ...createLiveQuestionPayload(currentQuestion, 0, ayudantia.questions.length, optionOrder),
      });
    }
  };

  const handleRevealAnswer = () => {
    audioService.stopMusic();
    audioService.playReveal();
    setPhase(GAME_PHASES.REVEAL);
    if (serviceRef.current) {
      serviceRef.current.broadcastState({
        phase: GAME_PHASES.REVEAL,
        correctAnswerIndex: currentQuestion.ans,
        answerType: currentQuestion.type || "single_choice",
        players: playersRef.current,
      });
    }
  };

  const handleShowLeaderboard = () => {
    audioService.stopMusic();
    setPhase(GAME_PHASES.LEADERBOARD);
    if (serviceRef.current) {
      serviceRef.current.broadcastState({
        phase: GAME_PHASES.LEADERBOARD,
        players: playersRef.current,
      });
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      audioService.stopMusic();
      setPhase(GAME_PHASES.FINISHED);
      const perfectPlayers = playersRef.current.filter((player) => player.correctAnswersCount === ayudantia.questions.length);
      if (serviceRef.current) {
        serviceRef.current.broadcastEnd({
          players: playersRef.current,
          perfectPlayerIds: perfectPlayers.map((player) => player.id),
          rewardCard: {
            title: ayudantia.cardTitle || ayudantia.title,
            subtitle: ayudantia.cardSubtitle || ayudantia.description || "Tarjeta de logro desbloqueada",
            image: ayudantia.cardImage || ayudantia.cardImageLegacy || "/assets/mascot.png",
            sealLogoSrc: ayudantia.sealLogoUrl || "/assets/seal_logo.jpg",
            courseLabel: ayudantia.courseLabel || ayudantia.course || "Quiz Ayudantías",
            quizTitle: ayudantia.title,
          },
        });
      }
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    const nextQuestion = ayudantia.questions[nextIndex];
    answeredPlayersRef.current.clear();
    questionEndedRef.current = false;
    const optionOrder = getQuestionOrder(nextQuestion);
    optionOrderRef.current = optionOrder;
    setCurrentQuestionIndex(nextIndex);
    setVotes({});
    setResponseCount(0);
    setRemainingSeconds(getQuestionTimeLimitSeconds(nextQuestion, ayudantia.defaultTimerSeconds || 60));
    setPhase(GAME_PHASES.QUESTION);
    questionStartTimeRef.current = Date.now();
    audioService.startQuestionMusic();

    if (serviceRef.current) {
      serviceRef.current.broadcastNext({
        timerSeconds: getQuestionTimeLimitSeconds(nextQuestion, ayudantia.defaultTimerSeconds || 60),
        ...createLiveQuestionPayload(nextQuestion, nextIndex, ayudantia.questions.length, optionOrder),
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalVotesCount = Object.values(votes).reduce((sum, v) => sum + v, 0);
  const perfectPlayers = players.filter((player) => player.correctAnswersCount === ayudantia.questions.length);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", padding: "24px 20px" }}>
      <header style={{ maxWidth: "1200px", margin: "0 auto 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={handleExit}>
            Salir al Menu
          </Button>
          <span style={{ fontWeight: 800, color: "var(--color-primary)", fontSize: "18px" }}>
            {ayudantia.title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button
            variant="secondary"
            size="sm"
            icon={isAudioMuted ? VolumeX : Volume2}
            onClick={handleToggleAudio}
            title={isAudioMuted ? "Activar musica y efectos de sonido" : "Silenciar audio"}
          >
            {isAudioMuted ? "Audio: Mute" : "Audio: ON"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={QrCode}
            onClick={() => setShowQrModal(true)}
            title="Mostrar codigo QR para estudiantes rezagados"
          >
            QR Sala
          </Button>

          <Badge variant="amber" icon={Users}>
            <span style={{ fontSize: "15px", fontWeight: 700 }}>{players.length} conectados</span>
          </Badge>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 700 }}>SALA:</span>
            <span style={{ fontFamily: "Consolas, monospace", fontWeight: 900, fontSize: "20px", color: "var(--color-primary)" }}>
              {roomCode}
            </span>
          </div>
        </div>
      </header>

      {/* Modal accesible de QR durante el juego */}
      {showQrModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "460px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-primary)" }}>
                Unirse a la Sala
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
              <QRCodeDisplay value={joinUrl} size={240} />
            </div>

            <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              Escanea con la camara del telefono para ingresar sin escribir el PIN.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <span style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {joinUrl}
              </span>
              <Button variant="secondary" size="sm" icon={copiedLink ? Check : Copy} onClick={handleCopyLink}>
                {copiedLink ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* 1. Fase de Lobby */}
        {phase === GAME_PHASES.LOBBY && (
          <Card style={{ padding: "36px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "1px" }}>
                Sala de Espera Docente
              </span>
              <h2 style={{ fontSize: "36px", fontWeight: 900, color: "var(--color-primary)", marginTop: "4px" }}>
                {ayudantia.title}
              </h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "18px", marginTop: "8px" }}>
                {ayudantia.subtitle}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "36px",
                alignItems: "center",
                marginBottom: "36px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", backgroundColor: "var(--color-bg)", borderRadius: "16px", border: "1px solid var(--color-border)" }}>
                <QRCodeDisplay value={joinUrl} size={250} />
                <div style={{ marginTop: "16px", textAlign: "center" }}>
                  <span style={{ fontSize: "14px", color: "var(--color-text-muted)", fontWeight: 600 }}>O ingresa directamente en:</span>
                  <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: "Consolas, monospace", fontWeight: 700, color: "var(--color-primary)", fontSize: "14px" }}>
                      {joinUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#2563EB", display: "flex", alignItems: "center" }}
                      title="Copiar enlace directo"
                    >
                      {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ padding: "18px 22px", backgroundColor: "#EFF6FF", borderRadius: "12px", border: "1px solid #BFDBFE" }}>
                  <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#1E40AF", marginBottom: "8px" }}>
                    Instrucciones para los Estudiantes:
                  </h4>
                  <ol style={{ paddingLeft: "20px", fontSize: "16px", color: "#1E3A8A", display: "flex", flexDirection: "column", gap: "6px", lineHeight: 1.4 }}>
                    <li>Escanea el codigo QR proyectado con tu celular.</li>
                    <li>Personaliza o conserva tu apodo anonimo asignado.</li>
                    <li>Presiona <strong>Entrar al Quiz</strong> para votar en vivo.</li>
                  </ol>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-text-main)" }}>
                      Estudiantes Conectados ({players.length}):
                    </h4>
                    <Badge variant={players.length > 0 ? "success" : "neutral"}>
                      <span style={{ fontSize: "14px" }}>{players.length > 0 ? "Listo para iniciar" : "Esperando alumnos"}</span>
                    </Badge>
                  </div>

                  {players.length === 0 ? (
                    <div style={{ padding: "28px", backgroundColor: "var(--color-bg)", borderRadius: "10px", border: "1px dashed var(--color-border)", color: "var(--color-text-muted)", fontSize: "16px", textAlign: "center" }}>
                      Aun no hay estudiantes conectados. Escanea el codigo para comenzar.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", maxHeight: "160px", overflowY: "auto", padding: "4px" }}>
                      {players.map((p) => (
                        <span
                          key={p.name}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#EEF2FF",
                            color: "var(--color-primary)",
                            fontWeight: 700,
                            borderRadius: "20px",
                            fontSize: "15px",
                            border: "1px solid #C7D2FE",
                          }}
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", borderTop: "1px solid var(--color-border)", paddingTop: "24px" }}>
              <Button
                variant="accent"
                size="lg"
                icon={Play}
                onClick={handleStartGame}
                disabled={players.length === 0}
              >
                Comenzar Quiz ({players.length} estudiantes)
              </Button>
            </div>
          </Card>
        )}

        {/* 2. Fase de Pregunta y Votacion */}
        {phase === GAME_PHASES.QUESTION && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Badge variant="navy">
                <span style={{ fontSize: "16px", fontWeight: 700 }}>
                  Pregunta {currentQuestionIndex + 1} de {ayudantia.questions.length}
                </span>
              </Badge>
              <TimerRing
                remainingSeconds={remainingSeconds}
                totalSeconds={getQuestionTimeLimitSeconds(currentQuestion, ayudantia.defaultTimerSeconds || 60)}
                size={96}
                strokeWidth={7}
              />
              <Badge variant="amber" icon={Users}>
                <span style={{ fontSize: "16px", fontWeight: 700 }}>
                  {responseCount} / {players.length} respuestas
                </span>
              </Badge>
            </div>

            <QuestionCard
              question={currentQuestion}
              currentIndex={currentQuestionIndex}
              totalQuestions={ayudantia.questions.length}
              isRevealed={false}
              showExplanation={false}
            />

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <Button variant="secondary" onClick={handleTimeUp}>
                Cerrar Tiempo Manualmente
              </Button>
            </div>
          </div>
        )}

        {/* 3. Fase de Votos Recibidos */}
        {phase === GAME_PHASES.VOTES && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Badge variant="neutral">
                <span style={{ fontSize: "16px" }}>Tiempo Finalizado</span>
              </Badge>
              <Badge variant="amber">
                <span style={{ fontSize: "16px" }}>Respuestas recibidas: {responseCount}</span>
              </Badge>
            </div>

            <QuestionCard
              question={currentQuestion}
              currentIndex={currentQuestionIndex}
              totalQuestions={ayudantia.questions.length}
              isRevealed={false}
              showExplanation={false}
            />

            {!isShortAnswer(currentQuestion) && !isOrdering(currentQuestion) && (
              <Card title="Distribucion de Respuestas" subtitle="Votos emitidos por los estudiantes en la sala" style={{ marginTop: "24px", maxWidth: "980px", margin: "24px auto 0" }}>
                <VoteBars votes={votes} totalVotes={totalVotesCount} optionsCount={currentQuestion.opts?.length || 4} />
              </Card>
            )}

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="primary" icon={Eye} onClick={handleRevealAnswer}>
                Revelar Respuesta Correcta
              </Button>
            </div>
          </div>
        )}

        {/* 4. Fase de Revelacion */}
        {phase === GAME_PHASES.REVEAL && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Badge variant="success">
                <span style={{ fontSize: "16px" }}>Respuesta Oficial y Fundamento</span>
              </Badge>
              <Badge variant="amber">
                <span style={{ fontSize: "16px" }}>Respuestas recibidas: {responseCount}</span>
              </Badge>
            </div>

            <QuestionCard
              question={currentQuestion}
              currentIndex={currentQuestionIndex}
              totalQuestions={ayudantia.questions.length}
              isRevealed={true}
              showExplanation={true}
            />

            {!isShortAnswer(currentQuestion) && !isOrdering(currentQuestion) && (
              <Card title="Distribucion de Respuestas" subtitle="La barra verde senala la opcion correcta" style={{ marginTop: "24px", maxWidth: "980px", margin: "24px auto 0" }}>
                <VoteBars
                  votes={votes}
                  totalVotes={totalVotesCount}
                  correctAnswerIndex={currentQuestion.ans}
                  isRevealed={true}
                  optionsCount={currentQuestion.opts?.length || 4}
                />
              </Card>
            )}

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="primary" icon={ArrowRight} onClick={handleShowLeaderboard}>
                Ver Tabla de Posiciones
              </Button>
            </div>
          </div>
        )}

        {/* 5. Fase de Tabla de Posiciones */}
        {phase === GAME_PHASES.LEADERBOARD && (
          <div>
            <Card title="Tabla de Posiciones Parcial" subtitle="Puntajes dinamicos calculados segun tiempo y precision" style={{ maxWidth: "860px", margin: "0 auto" }}>
              <Leaderboard players={players} />
            </Card>

            <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="accent" icon={ArrowRight} onClick={handleNextQuestion}>
                {isLastQuestion ? "Ver Podio Final" : "Siguiente Pregunta"}
              </Button>
            </div>
          </div>
        )}

        {/* 6. Fase Final y Podio */}
        {phase === GAME_PHASES.FINISHED && (
          <div>
            <Card style={{ textAlign: "center", padding: "44px 28px", marginBottom: "28px", maxWidth: "860px", margin: "0 auto 28px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "18px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <Trophy size={42} color="#D97706" />
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, color: "var(--color-primary)", marginBottom: "8px" }}>
                Quiz Finalizado con Exito
              </h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "18px" }}>
                Felicitaciones a todos los participantes de la ayudantia.
              </p>
            </Card>

            <Card
              title={`Logro perfecto · ${perfectPlayers.length}`}
              subtitle={`Participantes con ${ayudantia.questions.length} de ${ayudantia.questions.length} respuestas correctas`}
              style={{ maxWidth: "860px", margin: "0 auto 28px" }}
            >
              {perfectPlayers.length ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {perfectPlayers.map((player) => <Badge key={player.id} variant="success" icon={Trophy}>{player.name}</Badge>)}
                </div>
              ) : (
                <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Nadie obtuvo todas las respuestas correctas esta vez. ¡A intentarlo de nuevo!</p>
              )}
            </Card>

            <Card title="Podio Final y Clasificacion" subtitle="Resultados definitivos de la sesion" style={{ maxWidth: "860px", margin: "0 auto" }}>
              <Leaderboard players={players} maxEntries={10} />
            </Card>

            <div style={{ marginTop: "28px", display: "flex", justifyContent: "center", gap: "14px" }}>
              <Button variant="primary" icon={RotateCcw} onClick={handleStartGame}>
                Reiniciar Mismo Quiz
              </Button>
              <Button variant="secondary" onClick={handleExit}>
                Volver al Hub
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
