import React, { useState } from "react";
import { getAyudantiaByCode } from "../data";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { sanitizeNickname, sanitizeRoomCode, generateAnonymousAlias } from "../utils/sanitizers";
import { Smartphone, Shuffle, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import type { FormEvent } from "react";
import type { QuizDefinition } from "../types";

export default function FastJoinScreen({ roomCode, onJoin, onGoToHub }: { roomCode: string; onJoin: (player: { name: string; roomCode: string; ayudantia: QuizDefinition }) => void; onGoToHub: () => void }) {
  const cleanCode = sanitizeRoomCode(roomCode);
  const matchingAyudantia = getAyudantiaByCode(cleanCode);
  const hasKnownQuiz = matchingAyudantia.code === cleanCode || matchingAyudantia.altCodes?.includes(cleanCode);

  const [nickname, setNickname] = useState(generateAnonymousAlias);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");

    const cleanNick = sanitizeNickname(nickname);
    if (!cleanNick || cleanNick.trim().length < 2) {
      setValidationError("Por favor ingresa un apodo de al menos 2 caracteres.");
      return;
    }

    onJoin({
      name: cleanNick,
      roomCode: cleanCode || matchingAyudantia.code,
      ayudantia: matchingAyudantia,
    });
  };

  const handleRandomize = () => {
    setNickname(generateAnonymousAlias());
    setValidationError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: "440px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Badge variant="navy" style={{ marginBottom: "8px" }}>
            {hasKnownQuiz ? "Ingeniería de Software 2026-02" : "Quiz en vivo"}
          </Badge>
          <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#1E2761", margin: 0 }}>
            {hasKnownQuiz ? matchingAyudantia.title : "Quiz de la sala"}
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
            Unirse a la actividad interactiva en tiempo real
          </p>
        </div>

        <Card style={{ padding: "32px 24px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08)" }}>
          <div
            style={{
              padding: "14px 18px",
              backgroundColor: "#EEF2FF",
              borderRadius: "12px",
              border: "1px solid #C7D2FE",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "1px" }}>
                Sala Asignada
              </span>
              <span style={{ display: "block", fontFamily: "Consolas, monospace", fontSize: "22px", fontWeight: 900, color: "#1E2761" }}>
                {cleanCode || matchingAyudantia.code}
              </span>
            </div>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Smartphone size={22} color="#1E2761" />
            </div>
          </div>

          {validationError && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "16px",
                fontWeight: 600,
              }}
            >
              {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Tu Apodo para la Sesion:
              </label>

              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="Ej: Estudiante-1234"
                  maxLength={15}
                  autoFocus
                  style={{
                    flex: 1,
                    minWidth: 0,
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #CBD5E1",
                    fontSize: "15px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={handleRandomize}
                  style={{
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    padding: "0 14px",
                    backgroundColor: "#F1F5F9",
                    border: "1.5px solid #CBD5E1",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#334155",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxSizing: "border-box",
                  }}
                  title="Generar apodo aleatorio anonimo"
                >
                  <Shuffle size={15} />
                  <span>Aleatorio</span>
                </button>
              </div>
              <span style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginTop: "4px" }}>
                Puedes usar el apodo sugerido o escribir tu propio nombre.
              </span>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              fullWidth
              icon={ArrowRight}
              style={{ marginTop: "8px" }}
            >
              Entrar al Quiz
            </Button>
          </form>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "11.5px",
              color: "#64748B",
            }}
          >
            <ShieldCheck size={14} color="#16A34A" />
            <span>Minimizacion de datos: sin registro de RUT ni correo (Ley N° 21.719)</span>
          </div>
        </Card>

        {onGoToHub && (
          <div style={{ textAlign: "center", marginTop: "18px" }}>
            <button
              type="button"
              onClick={onGoToHub}
              style={{
                background: "none",
                border: "none",
                color: "#64748B",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                textDecoration: "underline",
              }}
            >
              <HelpCircle size={14} />
              <span>Ver menu principal completo de ayudantias</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
