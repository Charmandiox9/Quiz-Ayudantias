import React, { useState, useEffect, useRef } from "react";
import { RealtimeQuizService } from "../services/realtimeService";
import { GAME_PHASES, OPTION_COLORS, OPTION_LABELS } from "../config/constants";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { getPlayerDeviceId, clearActiveSession } from "../utils/session";
import { answerLabels, isAnswerCorrect, isMultipleSelect } from "../utils/answers";
import { CheckCircle, Clock, Trophy, ArrowLeft, Wifi, AlertTriangle, XCircle, Award, Zap } from "lucide-react";

export default function PlayerScreen({ playerInfo, onExit }) {
  const [gameState, setGameState] = useState({
    phase: GAME_PHASES.LOBBY,
    questionIndex: 0,
    totalQuestions: 1,
    correctAnswerIndex: null,
    answerType: "single_choice",
    optionTexts: [],
    players: [],
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [localLastEarned, setLocalLastEarned] = useState(null);
  const serviceRef = useRef(null);

  const playerId = playerInfo.playerId || getPlayerDeviceId();

  useEffect(() => {
    const service = new RealtimeQuizService(playerInfo.roomCode);
    serviceRef.current = service;

    service.subscribe({
      onConnected: () => {
        setIsConnected(true);
        service.trackPresence({
          id: playerId,
          name: playerInfo.name,
          score: 0,
        });
        service.broadcastJoin({
          id: playerId,
          name: playerInfo.name,
        });
      },
      onGameState: (state) => {
        setGameState((prev) => ({ ...prev, ...state }));
        if (state.players && Array.isArray(state.players)) {
          const myEntry = state.players.find(
            (p) => (playerId && p.id === playerId) || p.name.toLowerCase() === playerInfo.name.toLowerCase()
          );
          if (myEntry) {
            setLocalScore(myEntry.score || 0);
            if (myEntry.lastEarnedPoints !== undefined) {
              setLocalLastEarned(myEntry.lastEarnedPoints);
            }
          }
        }
      },
      onNextQuestion: (data) => {
        setGameState((prev) => ({
          ...prev,
          phase: GAME_PHASES.QUESTION,
          questionIndex: data.questionIndex,
          totalQuestions: data.totalQuestions,
          correctAnswerIndex: null,
          answerType: data.answerType || "single_choice",
          optionTexts: data.optionTexts || [],
        }));
        setSelectedOption(null);
        setHasVoted(false);
        setLocalLastEarned(null);
      },
      onGameEnd: (summary) => {
        setGameState((prev) => ({
          ...prev,
          phase: GAME_PHASES.FINISHED,
          ...(summary || {}),
        }));
      },
    });

    return () => {
      service.unsubscribe();
    };
  }, [playerInfo.roomCode, playerInfo.name, playerId]);

  const sendVote = (answer) => {
    if (hasVoted || gameState.phase !== GAME_PHASES.QUESTION) return;
    setHasVoted(true);

    if (serviceRef.current) {
      serviceRef.current.broadcastVote({
        playerId,
        playerName: playerInfo.name,
        answer,
        optionLabel: Number.isInteger(answer) ? OPTION_LABELS[answer] : undefined,
      });
    }
  };

  const handleVote = (optionIndex) => {
    if (hasVoted || gameState.phase !== GAME_PHASES.QUESTION) return;
    if (isMultipleSelect({ type: gameState.answerType })) {
      setSelectedOption((previous) => {
        const selected = Array.isArray(previous) ? previous : [];
        return selected.includes(optionIndex)
          ? selected.filter((index) => index !== optionIndex)
          : [...selected, optionIndex].sort((a, b) => a - b);
      });
      return;
    }
    setSelectedOption(optionIndex);
    sendVote(optionIndex);
  };

  const handleSubmitMultiSelect = () => {
    if (!Array.isArray(selectedOption) || selectedOption.length === 0) return;
    sendVote(selectedOption);
  };

  const handleExit = () => {
    clearActiveSession();
    onExit();
  };

  const correctLetter =
    gameState.correctAnswerIndex !== null && gameState.correctAnswerIndex !== undefined
      ? answerLabels(gameState.correctAnswerIndex).join(", ")
      : null;
  const isCorrect = hasVoted && isAnswerCorrect(
    { type: gameState.answerType, ans: gameState.correctAnswerIndex },
    selectedOption
  );
  const selectedLabels = answerLabels(selectedOption).join(", ");
  const answerOptions = gameState.optionTexts?.length
    ? gameState.optionTexts
    : OPTION_LABELS.slice(0, 4);

  // Calculo de ranking personal
  const sortedPlayers = [...(gameState.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
  const myRankIndex = sortedPlayers.findIndex(
    (p) => (playerId && p.id === playerId) || p.name.toLowerCase() === playerInfo.name.toLowerCase()
  );
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  const totalPlayersCount = sortedPlayers.length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", padding: "16px" }}>
      <header style={{ maxWidth: "520px", margin: "0 auto 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <button
          type="button"
          onClick={handleExit}
          style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
        >
          <ArrowLeft size={18} />
          <span>Salir</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Badge variant={isConnected ? "success" : "neutral"} icon={Wifi}>
            {isConnected ? "En vivo" : "Conectando"}
          </Badge>
          <Badge variant="navy">
            <span style={{ fontWeight: 800 }}>{playerInfo.name}</span>
          </Badge>
          <Badge variant="amber" icon={Trophy}>
            <span style={{ fontWeight: 900, fontFamily: "Consolas, monospace" }}>{localScore} pts</span>
          </Badge>
          {myRank && (
            <Badge variant="neutral">
              <span style={{ fontWeight: 700 }}>#{myRank}</span>
            </Badge>
          )}
        </div>
      </header>

      <main style={{ maxWidth: "520px", margin: "0 auto" }}>
        {/* 1. Espera en Lobby */}
        {gameState.phase === GAME_PHASES.LOBBY && (
          <Card style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <Clock size={32} color="#D97706" />
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-primary)", marginBottom: "8px" }}>
              Estas dentro de la sala
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "16px", lineHeight: 1.5, marginBottom: "16px" }}>
              Espera a que el docente o ayudante inicie el quiz en la pantalla del proyector.
            </p>
            <div style={{ padding: "12px", backgroundColor: "var(--color-surface-muted)", borderRadius: "10px", display: "inline-block" }}>
              <span style={{ fontSize: "14px", color: "var(--color-text-muted)", fontWeight: 600 }}>SALA: </span>
              <span style={{ fontFamily: "Consolas, monospace", fontWeight: 800, fontSize: "18px", color: "var(--color-primary)" }}>
                {playerInfo.roomCode}
              </span>
            </div>
          </Card>
        )}

        {/* 2. Pantalla de Votacion */}
        {gameState.phase === GAME_PHASES.QUESTION && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-secondary)" }}>
                Pregunta {gameState.questionIndex + 1} de {gameState.totalQuestions}
              </span>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-text-main)", marginTop: "4px" }}>
                {gameState.answerType === "multiple_select"
                  ? "Selecciona todas las alternativas que correspondan:"
                  : "Elige tu respuesta en la pantalla:"}
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
              {answerOptions.map((optionText, optionIndex) => {
                const label = OPTION_LABELS[optionIndex] || String(optionIndex + 1);
                const color = OPTION_COLORS[label] || "#475569";
                const isSelected = Array.isArray(selectedOption)
                  ? selectedOption.includes(optionIndex)
                  : selectedOption === optionIndex;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleVote(optionIndex)}
                    disabled={hasVoted}
                    style={{
                      minHeight: "clamp(95px, 20vh, 135px)",
                      borderRadius: "16px",
                      backgroundColor: color,
                      color: "#FFFFFF",
                      border: isSelected ? "5px solid #0F172A" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "clamp(32px, 8vw, 44px)",
                      fontWeight: 900,
                      fontFamily: "Consolas, monospace",
                      cursor: hasVoted ? "default" : "pointer",
                      opacity: hasVoted && !isSelected ? 0.4 : 1,
                      transform: isSelected ? "scale(1.03)" : "none",
                      transition: "transform 0.2s ease, opacity 0.2s ease, border-color 0.2s ease",
                      boxShadow: "0 6px 12px -2px rgb(0 0 0 / 0.15)",
                      flexDirection: "column",
                      gap: 5,
                      padding: "12px 8px",
                    }}
                  >
                    {label}
                    {answerOptions.length <= 2 && <span style={{ font: "600 14px var(--font-sans)" }}>{optionText}</span>}
                  </button>
                );
              })}
            </div>

            {gameState.answerType === "multiple_select" && (
              <Button
                variant="primary"
                fullWidth
                disabled={!Array.isArray(selectedOption) || selectedOption.length === 0 || hasVoted}
                onClick={handleSubmitMultiSelect}
                style={{ marginTop: 14 }}
              >
                Confirmar selección
              </Button>
            )}

            {hasVoted && (
              <div style={{ textAlign: "center", marginTop: "24px", padding: "16px", backgroundColor: "var(--color-success-bg)", borderRadius: "12px", border: "2px solid #BBF7D0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#15803D", fontWeight: 800, fontSize: "17px" }}>
                  <CheckCircle size={20} />
                  <span>Respuesta registrada: {selectedLabels}</span>
                </div>
                <p style={{ fontSize: "14px", color: "#166534", marginTop: "4px", fontWeight: 500 }}>
                  Respuesta enviada. Esperando el cierre del tiempo en el proyector...
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. Pantalla de Votos Recibidos */}
        {gameState.phase === GAME_PHASES.VOTES && (
          <Card style={{ textAlign: "center", padding: "36px 20px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Clock size={28} color="var(--color-primary)" />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-text-main)", marginBottom: "8px" }}>
              Tiempo Finalizado
            </h3>
            <p style={{ fontSize: "16px", color: "var(--color-text-secondary)" }}>
              Revisa la pantalla del proyector mientras se calculan los votos de la sala.
            </p>
          </Card>
        )}

        {/* 4. Pantalla de Revelacion con Puntaje en Tiempo Real */}
        {gameState.phase === GAME_PHASES.REVEAL && (
          <Card style={{ textAlign: "center", padding: "36px 20px" }}>
            {hasVoted ? (
              isCorrect ? (
                <div>
                  <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "var(--color-success-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <CheckCircle size={36} color="var(--color-success)" />
                  </div>
                  <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#15803D", marginBottom: "6px" }}>
                    Respuesta Correcta
                  </h3>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 18px", backgroundColor: "#DCFCE7", borderRadius: "20px", border: "1px solid #86EFAC", margin: "8px 0 14px" }}>
                    <Zap size={18} color="#16A34A" />
                    <span style={{ fontSize: "18px", fontWeight: 900, color: "#15803D", fontFamily: "Consolas, monospace" }}>
                      +{localLastEarned || 500} pts por rapidez
                    </span>
                  </div>
                  <p style={{ fontSize: "16px", color: "var(--color-text-main)", fontWeight: 700, marginBottom: "4px" }}>
                    Tu puntaje acumulado: <span style={{ color: "var(--color-primary)", fontFamily: "Consolas, monospace" }}>{localScore} pts</span>
                  </p>
                  {myRank && (
                    <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Posicion actual: <strong>Puesto #{myRank}</strong> de {totalPlayersCount}
                    </p>
                  )}
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "12px" }}>
                    Mira el proyector para ver el fundamento tecnico detallado.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "var(--color-danger-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <XCircle size={36} color="var(--color-danger)" />
                  </div>
                  <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#991B1B", marginBottom: "6px" }}>
                    Respuesta Incorrecta
                  </h3>
                  <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", marginBottom: "10px" }}>
                    Elegiste <strong>{selectedLabels}</strong>. La correcta era <strong>{correctLetter}</strong>.
                  </p>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-main)" }}>
                    Puntaje actual: <span style={{ fontFamily: "Consolas, monospace" }}>{localScore} pts</span>
                  </p>
                  {myRank && (
                    <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                      Posicion actual: Puesto #{myRank} de {totalPlayersCount}
                    </p>
                  )}
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "12px" }}>
                    Revisa la explicacion en el proyector para aprender el concepto.
                  </p>
                </div>
              )
            ) : (
              <div>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <AlertTriangle size={34} color="var(--color-accent)" />
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#92400E", marginBottom: "6px" }}>
                  Sin Voto Registrado
                </h3>
                <p style={{ fontSize: "16px", color: "var(--color-text-secondary)" }}>
                  La respuesta correcta era la opcion <strong>{correctLetter}</strong>.
                </p>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-main)", marginTop: "10px" }}>
                  Puntaje acumulado: {localScore} pts
                </p>
              </div>
            )}
          </Card>
        )}

        {/* 5. Pantalla de Leaderboard */}
        {gameState.phase === GAME_PHASES.LEADERBOARD && (
          <Card style={{ textAlign: "center", padding: "36px 20px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Award size={30} color="var(--color-accent)" />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-primary)", marginBottom: "6px" }}>
              Clasificacion en Vivo
            </h3>
            <div style={{ padding: "16px", backgroundColor: "var(--color-bg)", borderRadius: "12px", border: "1px solid var(--color-border)", margin: "14px 0" }}>
              <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Tu rendimiento:</p>
              <p style={{ fontSize: "24px", fontWeight: 900, color: "var(--color-primary)", fontFamily: "Consolas, monospace" }}>
                {localScore} pts
              </p>
              {myRank && (
                <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-accent)", marginTop: "4px" }}>
                  Puesto #{myRank} de {totalPlayersCount} participantes
                </p>
              )}
            </div>
            <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              Mira el proyector para conocer los primeros lugares del podio.
            </p>
          </Card>
        )}

        {/* 6. Pantalla Final */}
        {gameState.phase === GAME_PHASES.FINISHED && (
          <Card style={{ textAlign: "center", padding: "44px 20px" }}>
            <Trophy size={48} color="var(--color-accent)" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "26px", fontWeight: 900, color: "var(--color-primary)", marginBottom: "8px" }}>
              Quiz Finalizado
            </h3>
            <div style={{ padding: "18px", backgroundColor: "#FEF3C7", borderRadius: "14px", border: "1px solid #FDE68A", margin: "16px 0 24px" }}>
              <p style={{ fontSize: "15px", color: "#92400E", fontWeight: 600 }}>Puntaje Final:</p>
              <p style={{ fontSize: "32px", fontWeight: 900, color: "#B45309", fontFamily: "Consolas, monospace" }}>
                {localScore} pts
              </p>
              {myRank && (
                <p style={{ fontSize: "18px", fontWeight: 800, color: "#1E2761", marginTop: "6px" }}>
                  Puesto Final: #{myRank} de {totalPlayersCount}
                </p>
              )}
            </div>
            <Button variant="primary" fullWidth size="lg" onClick={handleExit}>
              Salir al Menu
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
